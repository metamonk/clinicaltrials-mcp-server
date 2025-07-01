@upstash/redis option:

import { Redis } from '@upstash/redis'
const redis = new Redis({
  url: 'https://fond-peacock-44146.upstash.io',
  token: 'AaxyAAIjcDFjMTQwMDc4MjU5YTU0MDViODRmNzE4NzRlMzk1MTFmMXAxMA',
})

await redis.set("foo", "bar");
await redis.get("foo");

ioredis option: 
import Redis from "ioredis"

const client = new Redis("rediss://default:AaxyAAIjcDFjMTQwMDc4MjU5YTU0MDViODRmNzE4NzRlMzk1MTFmMXAxMA@fond-peacock-44146.upstash.io:6379");
await client.set('foo', 'bar');