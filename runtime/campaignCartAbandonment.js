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

const CampaignClient = require('./CampaignClient');
const CampaignMapper = require('./CampaignMapper');

/**
 * This action sends a transactional event to Adobe Campaign that contains a cart
 * and a user's email address.
 * 
 * @param {string} args.challenge       (optional) I/O Events webhook challenge.
 * @param {object} args.cart            Magento cart.
 * @param {string} args.email           Email address of user.
 * @param {object} args.config          Configuration object. See documentation in campaign-config-example.yaml.
 */
function campaignCartAbandonment(args) {

    if (args.challenge) {
        // Do not pass configuration.
        delete args.config
        return args;
    }

    // Skip execution of this action if no cart is provided.
    if (!args.cart || !args.email) {
        console.log("No cart or email provided.");
        return;
    }

    // Reject empty cart.
    if (!args.cart.products || args.cart.products.length === 0) {
        console.log("Cart rejected, no products in cart");
        return;
    }
    
    // Reject cart that has an order assigned already.
    if (args.cart.reserved_order_id && args.cart.reserved_order_id !== 0) {
        console.log("Cart rejected, order was already created");
        return;
    }

    // Reject inactive cart.
    if (!args.cart.is_active) {
        console.log("Cart rejected, cart is no longer active");
        return;
    }

    const client = new CampaignClient(args.config);

    return client.authenticate(args.config.jwtPayload).then(accessToken => {
        const mapper = new CampaignMapper(args.config);

        return client.sendTransactionalEvent(accessToken, args.config.eventId, mapper.map(args.cart, args.email));
    });
}

module.exports.main = campaignCartAbandonment;