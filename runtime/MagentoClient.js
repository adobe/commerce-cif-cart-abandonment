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

const rp = require('request-promise');

/**
 * Client to retrieve cart information from Magento via REST API.
 */
class MagentoClient {

    constructor(config) {
        this.authToken = config.authToken;
        this.host = config.host;
    }

    /**
     * Returns a Magento card that is enriched with totals and product information.
     * 
     * @param {string} cartId   Magento customer cart id.
     * @returns {object}        Magento cart.
     */
    getCart(cartId) {
        let cart;
        return Promise.all([this._getBaseCart(cartId), this._getTotals(cartId)]).then(res => {
            cart = res[0];
            cart.totals = res[1];

            // Add product details
            let promises = [];
            for (let item of cart.items) {
                promises.push(this._getProduct(item.sku));
            }
    
            // Wait for all product requests
            return Promise.all(promises);
        }).then(res => {
            cart.products = res;
            return Promise.resolve(cart);
        });
    }

    _getHeaders() {
        return {
            'Cache-Control': 'no-cache',
            'Authorization': `Bearer ${this.authToken}`
        };
    }

    _getBaseCart(cartId) {
        let options = {
            uri: `${this.host}/rest/V1/carts/${cartId}`,
            method: "GET",
            headers: this._getHeaders(),
            json: true
        }
    
        return rp(options);
    }

    _getTotals(cartId) {
        let options = {
            uri: `${this.host}/rest/V1/carts/${cartId}/totals`,
            method: "GET",
            headers: this._getHeaders(),
            json: true
        }
    
        return rp(options);
    }

    _getProduct(sku) {
        let options = {
            uri: `${this.host}/rest/V1/products/${sku}`,
            method: "GET",
            headers: this._getHeaders(),
            json: true
        };

        return rp(options);
    }
}

module.exports = MagentoClient;