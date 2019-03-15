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

const expect = require('chai').expect;
const nock = require('nock');
const proxyquire =  require('proxyquire');
const sinon = require('sinon');

const jwtMock = {
    sign: () => {},
    verify: () => {}
}

const CampaignClient = proxyquire('../CampaignClient', { 'jsonwebtoken': jwtMock });

describe('CampaignClient', () => {

    let client;
    beforeEach(() => {
        client = new CampaignClient({
            jwtExchange: 'http://my.jwt.exchange',
            campaignApiHost: 'http://my.campaign.host',
            organization: 'org',
            transactionalApi: 'myAPI'
        });
    });

    afterEach(() => {
        nock.cleanAll();
        sinon.restore();
    });

    it('gets a JWT token', () => {
        sinon.stub(jwtMock, 'sign').callsArgWith(3, null, "sample-token");
        return client._getJwt("sample-payload").then(token => {
            expect(token).to.equal("sample-token");
        });
    });

    it('verifies a JWT token', () => {
        sinon.stub(jwtMock, 'verify').callsArgWith(3, null, "sample-decoded");
        return client._verifyJwt("sample-token").then(res => {
            expect(res.content).to.equal("sample-decoded");
        });
    });

    it('exchanges a JWT token', () => {
        nock('http://my.jwt.exchange')
            .post('/')
            .reply(200, { access_token: 'sample-access-token' });

        return client._exchangeJwt("sample-token").then(res => {
            expect(nock.isDone()).to.be.true;
            expect(res.access_token).to.equal('sample-access-token');
        });
    });

    it('performs an authentication', () => {
        sinon.stub(jwtMock, 'sign').callsArgWith(3, null, "sample-token");
        sinon.stub(jwtMock, 'verify').callsArgWith(3, null, "sample-decoded");
        nock('http://my.jwt.exchange')
            .post(`/`)
            .reply(200, { access_token: 'sample-access-token' });

        return client.authenticate("sample-payload").then(res => {
            expect(nock.isDone()).to.be.true;
            expect(res).to.equal('sample-access-token');
        });
    });

    it('sends an transactional event', () => {
        nock('http://my.campaign.host')
            .post('/org/campaign/myAPI/myEvent')
            .reply(200);

        return client.sendTransactionalEvent('sample-access-token', 'myEvent', {}).then(() => {
            expect(nock.isDone()).to.be.true;
        });
    });

});