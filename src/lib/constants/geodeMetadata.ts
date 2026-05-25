/**
 * Mapeo de geodas a sus CIDs de metadata en IPFS
 * Generado desde pinata-metadata-individual-upload.json
 */

import { GeodeCategory, AxieClass } from "./geodes";

/**
 * Mapeo de categoria + clase → CID de metadata IPFS
 */
export const GEODE_METADATA_CIDS: Record<
  GeodeCategory,
  Record<AxieClass, string>
> = {
  [GeodeCategory.PETIT]: {
    [AxieClass.BEAST]:
      "bafkreibkzieoqhc4difjjihx5udepksli6bukwnrpdjsl7dn43653drp5i",
    [AxieClass.AQUA]:
      "bafkreiccqz4x2z7fujwhhnavp4ivvutfmew7u74ojpwcgv4l4v5yojf77u",
    [AxieClass.BIRD]:
      "bafkreid6g62tcw6zmxi55lnwisg6lypqrfhefsk7upnoi7e3fvqpoeappe",
    [AxieClass.REPTILE]:
      "bafkreiavmltkieuhotic62ppn7cikj5wflj6nzc5gih275nzcxyy4mpjqa",
    [AxieClass.BUG]:
      "bafkreiddbwfkpecqgxlykbr3hsmyy7j3uzki2md2bckgdahnnnxn2veat4",
    [AxieClass.PLANT]:
      "bafkreieifph5obmkrhncynu3exhjkks3hk3bwatbbtokv5apv7iak4myfe",
    [AxieClass.MECH]:
      "bafkreidgwnrppb7jr2mng5h4ntulkvnpgoinmphlrlat7sl7vtjna3pdei",
    [AxieClass.DUSK]:
      "bafkreie35trxliwmxuquoaehcx27nxdg6lb3susk2wwbjlzwukgu6dxk24",
    [AxieClass.DAWN]:
      "bafkreiexwrj7i7iusb47qejfvr7fr547dss572iy53vxr7jfg3htz2rhae",
  },
  [GeodeCategory.ALTO]: {
    [AxieClass.BEAST]:
      "bafkreiahtp4s23shkuqpkbivesrhigb5o6pfxmgvhhhxdy5m6ulhowcwjq",
    [AxieClass.AQUA]:
      "bafkreic4hw6n7jbl56fogfiy756zcegpwd3msmh3njpkzoljb5z3sgwwgm",
    [AxieClass.BIRD]:
      "bafkreig23u6kpo7uleuiy3ckhfy7tzfchyjm5jg4ehui4uhj5334gttciu",
    [AxieClass.REPTILE]:
      "bafkreibcmdc7cxgn3h6l5fp54kt5u6g7edl6ts3r2ss3lhkvcrzzydsenu",
    [AxieClass.BUG]:
      "bafkreibcwic2uqciuxqez75qldm2o7zawvufqksurq3fl3lwoovl6qgcj4",
    [AxieClass.PLANT]:
      "bafkreiav6w3di2wzmeo23ylv36z66fevifuxfi4zpoy3maak6vfazvxu7a",
    [AxieClass.MECH]:
      "bafkreicx47sanrvapxtwmduw4ectb2vdruppuk7a6lmykt7eektqrs2qja",
    [AxieClass.DUSK]:
      "bafkreiggynbrbtwkq4agvvzczixeukge7dzbz5xpkgnhz7vkyunuoslxoy",
    [AxieClass.DAWN]:
      "bafkreic2e5brd6oqoqshorlumphklfgvhhccd2z5j3z5klkxgphsxrlezy",
  },
  [GeodeCategory.ANIMAL]: {
    [AxieClass.BEAST]:
      "bafkreih4genz3sibh46cwmm25dkixtz474otgwyl7ujnovcchd6oxkqsfy",
    [AxieClass.AQUA]:
      "bafkreicmojj27l3moowfwhmawd3zbcsd5zut4btsisxhmcozkg4tdx4ntu",
    [AxieClass.BIRD]:
      "bafkreiapze4fvteyvby42qnkueadgg4kl5vgvfqdrqy3ztps75d3i4vz4i",
    [AxieClass.REPTILE]:
      "bafkreig6iye2kwxcax57fjdklts6hdk7tszys73x4l64yx5rsk5udtidem",
    [AxieClass.BUG]:
      "bafkreicqcl5mqfo2myrjkc54exyuhhdnup2gsomp6sv3lnpgj7xl735uhy",
    [AxieClass.PLANT]:
      "bafkreifuk3pamkq2h5aux6b3tfjzzd2vbrcloc5a4wtwc3vpybopkajksi",
    [AxieClass.MECH]:
      "bafkreic7iiw64ybru7t2pv75yrrnrvlj2z527rufdomiwp54fcwcntzzhe",
    [AxieClass.DUSK]:
      "bafkreifq42mqapzvuo26dlk6sxib3igmmzno3pynekxcudk3k2smzjdkue",
    [AxieClass.DAWN]:
      "bafkreichkofxkyy43gsnhgu5cjeejvtt6snees466laxdq7omsncmuovw4",
  },
  // ULTRAMECH no tiene geodas en los datos actuales
  [GeodeCategory.ULTRAMECH]: {
    [AxieClass.BEAST]: "",
    [AxieClass.AQUA]: "",
    [AxieClass.BIRD]: "",
    [AxieClass.REPTILE]: "",
    [AxieClass.BUG]: "",
    [AxieClass.PLANT]: "",
    [AxieClass.MECH]: "",
    [AxieClass.DUSK]: "",
    [AxieClass.DAWN]: "",
  },
  // TANQUE no tiene geodas en los datos actuales
  [GeodeCategory.TANQUE]: {
    [AxieClass.BEAST]: "",
    [AxieClass.AQUA]: "",
    [AxieClass.BIRD]: "",
    [AxieClass.REPTILE]: "",
    [AxieClass.BUG]: "",
    [AxieClass.PLANT]: "",
    [AxieClass.MECH]: "",
    [AxieClass.DUSK]: "",
    [AxieClass.DAWN]: "",
  },
};

/**
 * Obtiene el CID de metadata de una geoda
 */
export function getGeodeMetadataCID(
  category: GeodeCategory,
  axieClass: AxieClass,
): string | null {
  const cid = GEODE_METADATA_CIDS[category]?.[axieClass];
  return cid || null;
}

/**
 * Obtiene la URI de metadata de una geoda
 */
export function getGeodeMetadataURI(
  category: GeodeCategory,
  axieClass: AxieClass,
): string | null {
  const cid = getGeodeMetadataCID(category, axieClass);
  return cid ? `ipfs://${cid}` : null;
}
