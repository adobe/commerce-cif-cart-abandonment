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
const proxyquire =  require('proxyquire');
const sinon = require('sinon');

class MockCampaignClient {
    authenticate() {}
    sendTransactionalEvent() {}
}

class MockCampaignMapper {
    map() {}
}

const campaignCartAbandonment = proxyquire('../campaignCartAbandonment.js', { 
    './CampaignClient': MockCampaignClient,
    './CampaignMapper': MockCampaignMapper
}).main;

describe('campaignCartAbandonment action', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('passes all parameters but configuration for a challenge', () => {
        let args = {
            config: {
                super: 'secret'
            },
            challenge: 'abc',
            sample: 'test'
        };
        let res = campaignCartAbandonment(args);
        expect(res).to.be.an('object');
        expect(res).to.have.all.key(['challenge', 'sample']);
        expect(res).to.not.have.property('config');
    });

    it('skips if no cart is given', () => {
        let args = {
            email: 'user@domain.com'
        };
        let res = campaignCartAbandonment(args);
        expect(res).to.be.undefined;
    });

    it('skips if cart is empty', () => {
        let args = {
            cart: {
                products: []
            },
            email: 'user@domain.com'
        };
        let res = campaignCartAbandonment(args);
        expect(res).to.be.undefined;
    });

    it('skips if cart has an order created already', () => {
        let args = {
            cart: {
                products: [
                    {}
                ],
                reserved_order_id: 123
            },
            email: 'user@domain.com'
        };
        let res = campaignCartAbandonment(args);
        expect(res).to.be.undefined;
    });

    it('skips if cart is inactive', () => {
        let args = {
            cart: {
                products: [
                    {}
                ],
                is_active: false
            },
            email: 'user@domain.com'
        };
        let res = campaignCartAbandonment(args);
        expect(res).to.be.undefined;
    });

    it('sends a transactional event', () => {
        let args = {
            cart: {
                products: [
                    {}
                ],
                is_active: true
            },
            email: 'user@domain.com',
            config: {
                jwtPayload: 'sample-payload'
            }
        };

        let authenticate = sinon.stub(MockCampaignClient.prototype, 'authenticate').resolves('sample-access-token');
        let sendTransactionalEvent = sinon.stub(MockCampaignClient.prototype, 'sendTransactionalEvent').resolves();
        let map = sinon.stub(MockCampaignMapper.prototype, 'map').returns({});

        return campaignCartAbandonment(args).then(() => {
            expect(authenticate.calledOnce).to.be.true;
            expect(map.calledOnce).to.be.true;
            expect(sendTransactionalEvent.calledOnce).to.be.true;
        });
    });

});
