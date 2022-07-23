# Service Worker Inspector

A Chrome extension for protection against Service Worker security vulnerabilities
by Niall Thurrat

## A university thesis

This application is the implementation of an innovative design work conducted for my thesis in the Web Programmer program at Linnaeus University.

## Abstract

The subject area of this thesis is cyber security and, more specifically, that related to service workers. This work focuses on the design of a Google Chrome extension called Service Worker Inspector (SWI) that has a single security feature aimed at identifying an open attack vector called Service Worker Cross-Site Scripting (SW-XSS). The attempt to create an open source solution to mitigate this open security threat is deemed valuable due to the long time taken by Google to address the problem as well as a void of security software specifically developed to address service worker threats. The final implemented method, dubbed the domain match method, tries to solve the problem while four evaluations aim to strengthen the credibility of the method. The most important aspects of design include popup information relating to a background SW-XSS security check, and network monitoring to find matches between service worker parameter URLs and script request URLs to third-party domains. The thesis concludes that the stated knowledge contribution to identify the vulnerability is not delivered as the implemented method produces false positives. The final artifact, however, is considered of value as it can be considered a good first step to a more complex process of accurate identification.

## Link

You can find the thesis document [here](https://docs.google.com/document/d/1gbD1gnbeSCAD26M9wZK3nrQPEJLX_jYqvViDHA6garI/edit?usp=sharing) if you are interested in reading it :)

## How to use SWI

SWI is a demo Chrome extension and can be used by cloning the GitHub repo and then using the 'Load unpacked' feature in 'Developer mode' in the Chrome Extensions manager to load the extention locally.
