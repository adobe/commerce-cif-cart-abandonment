/*******************************************************************************
 *
 *    Copyright 2019 Adobe. All rights reserved.
 *    This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License. You may obtain a copy
 *    of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software distributed under
 *    the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *    OF ANY KIND, either express or implied. See the License for the specific language
 *    governing permissions and limitations under the License.
 *
 ******************************************************************************/

'use strict';

const jwt = require('jsonwebtoken');
const rp = require('request-promise');

/**
 * Client to authenticate and communicate with Adobe Campaign.
 */
class CampaignClient {

    constructor(config) {
        this.privateKey = config.privateKey;
        this.publicKey = config.publicKey;
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
        this.organization = config.organization;
        this.transactionalApi = config.transactionalApi;
        this.jwtExchange = config.jwtExchange;
        this.campaignApiHost = config.campaignApiHost;
    }

    /**
     * Authenticates with Campaign API using JWT and returns access token.
     * 
     * @param {object} payload      JWT payload.
     * @returns {string}            Access token to be used in Bearer authorization header.
     */
    authenticate(payload) {
        return this._getJwt(payload).then(token => {
            return this._verifyJwt(token);
        }).then(resp => {
            return this._exchangeJwt(resp.token);
        }).then(resp => {
            return Promise.resolve(resp.access_token);
        });
    }

    _getJwt(payload) {
        return new Promise((resolve, reject) => {
            jwt.sign(payload, this.privateKey, { 
                expiresIn: '10m',
                algorithm: 'RS256'
            }, (err, token) => {
                if (err) {
                    reject(err);
                }
                resolve(token);
            });
        });
    }
    
    _verifyJwt(jwtToken) {
        return new Promise((resolve, reject) => {
            jwt.verify(jwtToken, this.publicKey, { algorithms: ['RS256'] }, function(err, decoded) {
                if (err) {
                    reject(err);
                }
                resolve({ token: jwtToken, content: decoded });
            });
        });
    }
    
    _exchangeJwt(jwtToken) {
        let options = {
            uri: this.jwtExchange,
            method: 'POST',
            form: {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                jwt_token: jwtToken
            },
            headers: {
                'Cache-Control': 'no-cache',
            },
            json: true
        };
        return rp(options);
    }
    
    /**
     * Sends a transactional event to Adobe Campaign.
     * 
     * @param {string} accessToken      Bearer authorization token that was generated with authenticate().
     * @param {string} eventId          ID of the transactional event.
     * @param {object} event            Event body.
     * @returns {Promise}               Response object as promise.
     */
    sendTransactionalEvent(accessToken, eventId, event) {
        let options = {
            uri: `${this.campaignApiHost}/${this.organization}/campaign/${this.transactionalApi}/${eventId}`,
            method: 'POST',
            body: event,
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Cache-Control': 'no-cache',
                'X-Api-Key': this.clientId,
                'Content-Type': 'application/json;charset=utf-8'
            },
            json: true
        };
        return rp(options)
    }
}

module.exports = CampaignClient;