

import NodeCache from "node-cache";

export const appCache= new NodeCache({ stdTTL: 0, checkperiod: 0 });

export function getCacheValue(key: string){
    if (appCache.has(key)){
const getValues= appCache.get(key);
        return getValues ? getValues : undefined;
    }
   return undefined;

}

