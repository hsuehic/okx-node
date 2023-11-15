# property-value

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]

> Module to get property value with property path

## Install

```bash
npm install property-value
```

## Usage

```ts
import { getPropertyValue } from 'property-value';

interface Person {
  age: number;
  name: {
    first: string;
    middle?: string;
    last: string;
  };
}

const p: Person = {
  age: 15,
  name: {
    first: 'Yuyi',
    last: 'Xue',
  },
};

const firstName = getPropertyValue(p, 'name.first');
//=> 'Yuyi'
```

## API

### getPropertyValue<T, P>(obj: T, path: P)

#### obj

Type: `object`

The source object

#### path

Type: `string`

The path of the property to be received

[build-img]:https://github.com/hsuehic/okx-node/actions/workflows/release.yml/badge.svg
[build-url]:https://github.com/hsuehic/okx-node/actions/workflows/release.yml
[downloads-img]:https://img.shields.io/npm/dt/property-value
[downloads-url]:https://www.npmtrends.com/property-value
[npm-img]:https://img.shields.io/npm/v/property-value
[npm-url]:https://www.npmjs.com/package/property-value
[issues-img]:https://img.shields.io/github/issues/hsuehic/okx-node
[issues-url]:https://github.com/hsuehic/okx-node/issues
[codecov-img]:https://codecov.io/gh/hsuehic/okx-node/branch/main/graph/badge.svg
[codecov-url]:https://codecov.io/gh/hsuehic/okx-node
