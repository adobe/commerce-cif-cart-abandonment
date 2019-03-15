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

const MagentoClient = require('../MagentoClient');

describe('MagentoClient', () => {

    const authToken = "my-auth-token";
    const host = "http://my.magento.cloud";

    const cartId = "ab-cd-ef";

    const baseCart = {
        items: [
            { sku: "abc" },
            { sku: "def" }
        ]
    }

    const totals = {
        price: 123
    }

    const productA = { sku: "abc" };
    const productB = { sku: "def" };

    let client;
    beforeEach(() => {
        client = new MagentoClient({
            host: host,
            authToken: authToken
        });
    });

    afterEach(() => {
        nock.cleanAll();
    });

    it('returns a cart', () => {
        nock(host)
            .get(`/rest/V1/carts/${cartId}`)
            .reply(200, baseCart);

        nock(host)
            .get(`/rest/V1/carts/${cartId}/totals`)
            .reply(200, totals);

        nock(host)
            .get(`/rest/V1/products/abc`)
            .reply(200, productA);

            nock(host)
            .get(`/rest/V1/products/def`)
            .reply(200, productB);

        return client.getCart(cartId).then(cart => {
            expect(nock.isDone()).to.be.true;

            expect(cart).to.have.property("items");
            expect(cart.items).to.have.lengthOf(2);
            expect(cart).to.have.property("totals");
            expect(cart.totals).to.have.property("price");
            expect(cart).to.have.property("products");
            expect(cart.products).to.have.lengthOf(2);
            expect(cart.products[0]).to.have.property("sku");
            expect(cart.products[0].sku).to.equal(productA.sku);
        });
    });

    it('makes a base cart request', () => {
        nock(host, { reqheaders: { 'Authorization': `Bearer ${authToken}` } })
            .get(`/rest/V1/carts/${cartId}`)
            .reply(200);

        return client._getBaseCart(cartId).then(() => {
            expect(nock.isDone()).to.be.true;
        });
    });

    it('makes a get totals request', () => {
        nock(host, { reqheaders: { 'Authorization': `Bearer ${authToken}` } })
            .get(`/rest/V1/carts/${cartId}/totals`)
            .reply(200);

        return client._getTotals(cartId).then(() => {
            expect(nock.isDone()).to.be.true;
        });
    });

    it('makes a get product request', () => {
        nock(host, { reqheaders: { 'Authorization': `Bearer ${authToken}` } })
            .get(`/rest/V1/products/${productB.sku}`)
            .reply(200);

        return client._getProduct(productB.sku).then(() => {
            expect(nock.isDone()).to.be.true;
        });
    });

});