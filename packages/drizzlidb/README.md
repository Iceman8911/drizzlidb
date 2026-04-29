# drizzlidb

Typesafe drizzle-orm inspired abstraction over IndexedDB

## Installation

```bash
npm install drizzlidb
```

## Usage

```typescript
import { greet } from 'drizzlidb';

console.log(greet('World')); // Hello, World!
```

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Develop with watch mode
bun run dev

# Run tests
bun run test
```

## Design decisions

- Every method in the query builder returns a new object for immutability purposes, and so queries can be reused and extended as required.
- By default, tables are lazily initialized, however, `.init()` can be called and awaited.
- Tables map to idb object stores.


## License

MIT
