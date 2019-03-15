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

 /**
  * Maps a Magento cart and email address to an Adobe Campaign transactional event.
  * 
  * This mapper might need to be customized based on the definition of your transactional event.
  */
class CampaignMapper {

    constructor(config) {
        this.config = config;
    }

    _mapProduct(item, products) {
        let product = products.find(p => item.sku === p.sku);
        if (!product) {
            return;
        }

        let slug = product.custom_attributes.find(v => v.attribute_code === "url_key");
        if (slug) {
            slug = slug.value;
        }

        let image;
        if (product.media_gallery_entries && product.media_gallery_entries.length > 0) {
            image = product.media_gallery_entries[0].file;
        }

        return {
            sku: item.sku,
            slug: slug,
            name: item.name,
            path: this.config.productPageUrl.replace("{{slug}}", slug),
            price: item.price,
            quantity: item.qty,
            image: `${this.config.productAssetBaseUrl}${image}`
        };
    }

    _mapCart(cart) {
        let campaignCart = {
            total: cart.totals.grand_total,
            currency: cart.totals.base_currency_code,
            cartId: cart.id,
            products: []
        };

        for (let item of cart.items) {
            let product = this._mapProduct(item, cart.products);
            campaignCart.products.push(product);
        }

        return campaignCart;
    }

    /**
     * Maps Magento cart and email address to Adobe Campaign transactional event body.
     * 
     * @param {object} cart     Magento cart.
     * @param {string} email    Email address of the receiver of the transactional message.
     * @returns {object}        Transactional event body.
     */
    map(cart, email) {
        let campaignCart = this._mapCart(cart);

        return {
            "email": email,
            "ctx": campaignCart
        };
    }

}

module.exports = CampaignMapper;