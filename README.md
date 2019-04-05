[![CircleCI](https://circleci.com/gh/adobe/commerce-cif-cart-abandonment.svg?style=svg)](https://circleci.com/gh/adobe/commerce-cif-cart-abandonment)
[![codecov](https://codecov.io/gh/adobe/commerce-cif-cart-abandonment/branch/master/graph/badge.svg?token=OKEPfTKQ7l)](https://codecov.io/gh/adobe/commerce-cif-cart-abandonment)

# Magento - Campaign integration using Commerce Integration Framework (CIF) for Cart Abandonment

## Contents
1. [Overview](#1-overview)
2. [Requirements](#2-requirements)
3. [Setup](#3-setup)
4. [FAQ](#4-faq)

## 1. Overview
The goal of this integration between Magento and Adobe Campaign is to enable marketers to send cart abandonment emails listing cart products that were abandoned. This integration will work with Adobe Campaign Standard (ACS) and Magento 2.3 and 2.2 versions. Currently, ACS is unable to send abandoned cart emails that list the cart details (see [FAQ](#4-faq) section). CIF addresses this pain-point by accessing Magento's back-end shopping cart API and providing cart details to ACS by sending a payload to ACS's message center API. More importantly, the value CIF brings is the ability to inject business logic and enrich API calls to personalize shopper emails. CIF enables customization of workflows for different use-cases. Business logic can be injected by writing action sequences on Adobe I/O Runtime - Adobe's Serverless Platform.

## 2. Requirements
You need to have the following Experience Cloud solutions provisioned:

* Campaign
* Analytics
* Analytics Triggers
* I/O Events
* Launch
* I/O Runtime
* Magento

## 3. Setup

Please check the [wiki](https://github.com/adobe/commerce-cif-cart-abandonment/wiki).

## 4. FAQ

#### 1. How does ACS (Adobe Campaign Standard) handle cart abandonment emails without CIF?
ACS does not have the ability to calculate the right contents of a cart. It can display the content only if it has the right contents of the cart flowing in from a validated location either from Adobe Analytics (AA) or CIF. However, using AA only doesn’t solve this problem because AA keeps track of raw events, and adds products added in an array, products removed in an array. There is now way for AA to know schema of products added and it captures everything in arrays and passes them in arrays as is. Some script will be needed to keep track of the what products are added and removed. Currently, ACS does not allow scripting in the content block. So, the only way for ACS to display the cart contents is if they get cart id, pdt id, pdt qty from some table.

#### 2. What is Adobe I/O Runtime?
Please see https://www.adobe.io/apis/experienceplatform/runtime.html 
