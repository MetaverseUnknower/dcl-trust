import { Alchemy, Network } from "alchemy-sdk";
import axios from "axios";

const config = {
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

export const getDecentralandName = async (
  address: string,
): Promise<string | null> => {
  try {
    // First, get the owned Decentraland Name NFTs
    const nfts = await alchemy.nft.getNftsForOwner(address, {
      contractAddresses: ["0x2A187453064356c898cAe034EAed119E1663ACb8"], // Decentraland Names contract
    });
    console.log(nfts.ownedNfts);
    const ownedNames: (string | undefined)[] = nfts.ownedNfts
      .filter(
        (nft) =>
          nft.contract.address === "0x2A187453064356c898cAe034EAed119E1663ACb8",
      )
      .map((nft) => nft.name);
    console.log("Owned names:", ownedNames);
    // Then, check the equipped name using Decentraland's API
    const response = await axios.get(
      `https://peer.decentraland.org/lambdas/profiles/${address}`,
    );
    if (
      response.data &&
      response.data.avatars &&
      response.data.avatars.length > 0
    ) {
      const equippedName = response.data.avatars[0].name;
      console.log("Equipped name:", equippedName);
      // Check if the equipped name is in the list of owned names
      if (equippedName && ownedNames.includes(equippedName)) {
        return equippedName;
      }
    }
    // If no valid equipped name, return the first owned name (if any)
    if (ownedNames.length > 0) {
      return ownedNames.find((x) => x) || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching Decentraland name:", error);
    return null;
  }
};

export const getDecentralandRSVPs = async (
  address: string,
): Promise<number> => {
  try {
    const response = await axios.get(
      `https://events.decentraland.org/api/events`,
      {
        params: {
          attendee: address,
        },
      },
    );

    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data.length;
    }

    return 0;
  } catch (error) {
    console.error("Error fetching Decentraland RSVPs:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    throw error; // Rethrow the error so it can be handled by the caller
  }
};

export const getDecentralandProfile = async (address: string): Promise<any> => {
  try {
    const response = await axios.get(
      `https://peer.decentraland.org/lambdas/profiles/${address}`,
    );
    if (
      response.data &&
      response.data.avatars &&
      response.data.avatars.length > 0
    ) {
      return response.data.avatars[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching Decentraland profile:", error);
    return null;
  }
};
