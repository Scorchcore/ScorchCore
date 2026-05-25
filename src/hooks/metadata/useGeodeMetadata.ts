/**
 * Hook para cargar metadata de geoda desde IPFS
 */

import { useState, useEffect } from 'react';
import { GeodeCategory, AxieClass } from '@/lib/constants/geodes';
import { getGeodeMetadataURI } from '@/lib/constants/geodeMetadata';
import { fetchJSONFromIPFS } from '@/lib/utils/ipfs/ipfs';

export interface GeodeMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/**
 * Hook para cargar metadata de geoda desde IPFS
 */
export function useGeodeMetadata(category?: GeodeCategory, axieClass?: AxieClass) {
  const [metadata, setMetadata] = useState<GeodeMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (category === undefined || axieClass === undefined) {
      setMetadata(null);
      return;
    }

    let isMounted = true;

    async function loadMetadata() {
      setLoading(true);
      setError(null);

      try {
        const uri = getGeodeMetadataURI(category!, axieClass!);
        
        if (!uri) {
          throw new Error('No metadata URI found for this geode');
        }

        const data = await fetchJSONFromIPFS<GeodeMetadata>(uri, {
          timeout: 15000,
          retries: 1,
        });

        if (isMounted) {
          setMetadata(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('[useGeodeMetadata] Error loading metadata:', err);
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMetadata();

    return () => {
      isMounted = false;
    };
  }, [category, axieClass]);

  return { metadata, loading, error };
}
