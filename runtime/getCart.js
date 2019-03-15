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

const MagentoClient = require('./MagentoClient');

/**
 * This action receives an I/O Event and returns a customer cart from Magento.
 * 
 * @param {string} args.challenge       (optional) I/O Events webhook challenge.
 * @param {object} args.event           I/O Event body. 
 * @param {object} args.config          Configuration object. See documentation in magento-config-example.yaml.
 */
function getCart(args) {

    if (args.challenge) {
        // Do not pass configuration.
        delete args.config
        return args;
    }

    if (!args.event) {
        console.log("No event provided");
        return;
    }

    // Retrieve Analytics dimensions from I/O Event body.
    let dimensions = args.event['com.adobe.mcloud.pipeline.pipelineMessage']['com.adobe.mcloud.protocol.trigger'].enrichments.analyticsHitSummary.dimensions;

    // Get cart id.
    let cartIdDimension = dimensions[args.config.analyticsCartIdDimension];
    if (!cartIdDimension || cartIdDimension.data.length === 0) {
        console.log("Could not find cart id in event");
        return;
    }
    const cartId = cartIdDimension.data.pop();

    // Get email.
    let eMailDimension = dimensions[args.config.analyticsEMailDimension];
    if (!eMailDimension || eMailDimension.data.length === 0) {
        console.log("Could not find email in event");
        return;
    }
    const email = eMailDimension.data.pop();

    // Get cart from Magento.
    const client = new MagentoClient(args.config);
    return client.getCart(cartId).then(cart => {
        return Promise.resolve({
            cart: cart,
            cartId: cartId,
            email: email
        });
    });
}

module.exports.main = getCart;