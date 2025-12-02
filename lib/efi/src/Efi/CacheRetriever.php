<?php

namespace Efi;

use Symfony\Component\Cache\Adapter\FilesystemAdapter;

class CacheRetriever
{
	private $cache;

	/**
	 * CacheRetriever constructor.
	 *
	 * Initializes the cache adapter with a specified namespace.
	 */
	public function __construct()
	{
		$this->cache = new FilesystemAdapter('Efi');
	}

	/**
	 * Retrieves a value from the cache based on the provided key.
	 *
	 * @param string $key The cache key.
	 * @return mixed|null The cached value or null if not found.
	 */
	public function get(string $key)
	{
		$cacheItem = $this->cache->getItem($key);

		if ($cacheItem->isHit()) {
			return $cacheItem->get();
		}

		return null;
	}

	/**
	 * Sets a value in the cache with the specified key, value, and time-to-live (TTL).
	 *
	 * @param string $key The cache key.
	 * @param mixed $value The value to be cached.
	 * @param int|null $ttl The time-to-live in seconds (optional).
	 */
	public function set(string $key, $value, $ttl = null)
	{
		$cacheItem = $this->cache->getItem($key);
		$cacheItem->set($value);

		if ($ttl !== null) {
			$cacheItem->expiresAfter($ttl);
		}

		$this->cache->save($cacheItem);
	}

	/**
	 * Checks if specified cache items exist in the cache.
	 *
	 * @param array $items An array of cache keys to check.
	 * @return bool True if all specified cache keys exist, false otherwise.
	 */
	public function hasCache(array $items): bool
	{
		$cacheItems = $this->cache->hasItem($items[0]);

		return $cacheItems ?? false;
	}

	/**
	 * Clears all cached data.
	 */
	public function clear()
	{
		$this->cache->clear();
	}
}
