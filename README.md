[![CircleCI](https://circleci.com/gh/adobe/commerce-cif-cart-abandonment.svg?style=svg)](https://circleci.com/gh/adobe/commerce-cif-cart-abandonment)
[![codecov](https://codecov.io/gh/adobe/commerce-cif-cart-abandonment/branch/master/graph/badge.svg?token=OKEPfTKQ7l)](https://codecov.io/gh/adobe/commerce-cif-cart-abandonment)

# Magento - Campaign integration using Commerce Integration Framework (CIF) for Cart Abandonment

## Contents
1. [Overview](#1-overview)
2. [Requirements](#2-requirements)
3. [Setup](#3-setup)

## 1. Overview
The goal of this integration between Magento and Adobe Campaign is to enable marketers to send cart abandonment emails listing cart products that were abandoned. This integration will work with Adobe Campaign Standard (ACS) and Magento 2.3 and 2.2 versions. Currently, ACS is unable to send abandoned cart emails that list the cart details because of some limitations. CIF addresses this pain-point by accessing Magento's back-end shopping cart API and providing cart details to ACS by sending a payload to ACS's message center API. 

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