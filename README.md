Marketplace Frontend – Search & Product Module

This is a production-ready implementation of a search and product listing feature for an e-commerce marketplace, built with Next.js, TypeScript, React, ElasticSearch, and Zustand.

The code is adapted from a live telecom-backed platform serving 400K–700K monthly active users.
It’s designed for real-time accuracy, multilingual support (Mongolian + English), and smooth performance on both desktop and mobile.

## Features

-Full-text Search
Users can search by name, brand, or keywords — works seamlessly with both Cyrillic and Latin scripts.

-Real-time Stock Updates
WebSocket integration ensures stock data stays up-to-date without page reloads.

-Filtering & Sorting
Quickly filter and sort results on the client side across multiple criteria.

-Search History & Recently Viewed
Improves UX by remembering past searches and recently viewed items.

-Performance-first Architecture
Scoped state, memoization, and throttling deliver fast, responsive interactions.

## Why it matters

This module handles complex UI states, asynchronous data, and real-time updates in a scalable, maintainable way.
While building it, I focused on reusable components and lightweight client-side logic to make future updates easier.

## Tech Stack

Next.js – Routing & server-side rendering

TypeScript – Type safety

Zustand – Lightweight global state management

Socket.io-client – Real-time updates

Tailwind CSS – Responsive UI

Lodash – Utility functions

ElasticSearch – Fast, typo-tolerant search


## Structure
/search/[field]/[item]/page.tsx – Dynamic search results

/searched/page.tsx – Recently searched items

/seen/page.tsx – Recently viewed items

layout.tsx – Layout wrapper

page.tsx – Main search landing

searchStore.ts – Zustand store

This snippet represents a small part of my broader full-stack work, which includes real-time commerce, containerized deployments (Docker/Kubernetes), and multi-database integration (PostgreSQL, MongoDB, ElasticSearch, Redis).
