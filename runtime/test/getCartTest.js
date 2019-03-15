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

class MockMagentoClient {
    getCart() {}
}

const getCart = proxyquire('../getCart', { './MagentoClient': MockMagentoClient }).main;

describe('getCart action', () => {

    const sampleCart = {
        "id": 123
    };

    let eventArgs;
    beforeEach(() => { 
        eventArgs = {
            "event": {
                "com.adobe.mcloud.pipeline.pipelineMessage": {
                    "com.adobe.mcloud.protocol.trigger": {
                        "enrichments": {
                            "analyticsHitSummary": {
                                "dimensions": {
                                    "eVar3": {
                                        "data": [
                                            "n3cLIuSdlMjYuNWxamX1C8s9S0i2TRGD",
                                        ],
                                        "name": "eVar3"
                                    },
                                    "eVar4": {
                                        "data": [
                                            "user@domain.com",
                                        ],
                                        "name": "eVar4"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "config": {
                analyticsCartIdDimension: "eVar3",
                analyticsEMailDimension: "eVar4"
            }
        }
    });

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
        let res = getCart(args);
        expect(res).to.be.an('object');
        expect(res).to.have.all.key(['challenge', 'sample']);
        expect(res).to.not.have.property('config');
    });

    it('skips if no event is given', () => {
        let args = {};
        let res = getCart(args);
        expect(res).to.be.undefined;
    });

    it('skips if the cart id is missing from the event', () => {
        delete eventArgs.event['com.adobe.mcloud.pipeline.pipelineMessage']['com.adobe.mcloud.protocol.trigger'].enrichments.analyticsHitSummary.dimensions.eVar3;

        let res = getCart(eventArgs);
        expect(res).to.be.undefined;
    });

    it('skips if the email is missing from the event', () => {
        delete eventArgs.event['com.adobe.mcloud.pipeline.pipelineMessage']['com.adobe.mcloud.protocol.trigger'].enrichments.analyticsHitSummary.dimensions.eVar4;

        let res = getCart(eventArgs);
        expect(res).to.be.undefined;
    });

    it('returns a cart', () => {
        sinon.stub(MockMagentoClient.prototype, 'getCart').resolves(sampleCart);
        return getCart(eventArgs).then(res => {
            expect(res).to.have.all.keys(['cart', 'cartId', 'email']);
            expect(res.cart).to.deep.equal(sampleCart);
            expect(res.cartId).to.equal('n3cLIuSdlMjYuNWxamX1C8s9S0i2TRGD');
            expect(res.email).to.deep.equal('user@domain.com');
        });
    });

});