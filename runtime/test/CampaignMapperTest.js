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
const sinon = require('sinon');

const CampaignMapper = require('../CampaignMapper');

describe('CampaignMapper', () => {

    const email = 'user@domain.com';
    const magentoCart = {
        "id": 13766,
        "items": [
            {
                "item_id": 12711,
                "name": "El Gordo Down Jacket",
                "price": 119,
                "product_type": "configurable",
                "qty": 1,
                "sku": "meskwielt-Green-M"
            }
        ],
        "products": [
            {
                "custom_attributes": [
                    {
                        "attribute_code": "url_key",
                        "value": "meskwielt-green-m"
                    }
                ],
                "media_gallery_entries": [
                    {
                        "file": "/e/l/el_gordo_green_2.jpg",
                    }
                ],
                "name": "El Gordo Down Jacket",
                "price": 119,
                "sku": "meskwielt-Green-M",
            }
        ],
        "totals": {
            "base_currency_code": "USD",
            "grand_total": 119
        }
    };

    const config = {
        productPageUrl: "http://localhost/product/{{slug}}.html",
        productAssetBaseUrl: "http://my.magentosite.cloud/media/catalog/product"
    };

    afterEach(() => {
        sinon.restore();
    });

    it('maps a cart', () => {
        let mapper = new CampaignMapper(config);
        sinon.stub(mapper, "_mapProduct").returns({});

        let cart = mapper._mapCart(magentoCart);

        expect(cart.total).to.equal(magentoCart.totals.grand_total);
        expect(cart.currency).to.equal(magentoCart.totals.base_currency_code);
        expect(cart.cartId).to.equal(magentoCart.id);
        expect(cart.products).to.have.lengthOf(1);
    });

    it('maps a product', () => {
        let firstItem = magentoCart.items[0];

        let mapper = new CampaignMapper(config);

        let product = mapper._mapProduct(firstItem, magentoCart.products);

        expect(product.sku).to.equal(firstItem.sku);
        expect(product.slug).to.equal('meskwielt-green-m');
        expect(product.name).to.equal(firstItem.name);
        expect(product.path).to.equal('http://localhost/product/meskwielt-green-m.html');
        expect(product.price).to.equal(firstItem.price);
        expect(product.quantity).to.equal(firstItem.qty);
        expect(product.image).to.equal('http://my.magentosite.cloud/media/catalog/product/e/l/el_gordo_green_2.jpg');
    });

    it('maps cart and email to a transactional event', () => {
        let mapper = new CampaignMapper(config);
        sinon.stub(mapper, "_mapCart").returns({});

        let event = mapper.map({}, email);

        expect(event.email).to.equal(email);
        expect(event).to.have.property('ctx');
    });

});