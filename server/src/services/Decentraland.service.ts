// ./services/Decentraland.service.ts

import { Alchemy, Network } from "alchemy-sdk";
import axios from "axios";

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  isTier: boolean;
  completedAt: string | null;
  progress: {
    stepsDone: number;
    achievedTiers: { tierId: string; completedAt: string }[];
  };
}
interface BadgesResponse {
  data: {
    achieved: Badge[];
    notAchieved: Badge[];
  };
}

export class DecentralandService {
  static async checkUserBadges(
    address: string,
    badgeIds: string[],
    tierIds: string[] = [],
    stepsRequired: number[] = []
  ): Promise<number> {
    try {
      const response = await axios.get<BadgesResponse>(
        `https://badges.decentraland.org/users/${address}/badges`
      );

      const achievedBadges = response.data.data.achieved;

      return badgeIds.reduce((count, badgeId, index) => {
        const requiredTier = tierIds[index],
          requiredSteps = stepsRequired[index],
          now = new Date(),
          daysAgo28 = new Date(
            now.getTime() - 28 * 24 * 60 * 60 * 1000
          ).getTime();

        // Find the corresponding badge in the payload
        const badge = achievedBadges.find(
          (achievedBadge: any) => achievedBadge.id === badgeId
        );

        if (!badge) {
          return count; // Return the count without incrementing if the badge is not achieved
        }

        // Check if the badge is a Decentraland Citizen badge that was completed more than 28 days ago
        if (
          badge.name === "dclcitizen" &&
          Number(badge.completedAt) <= daysAgo28
        ) {
          return count + 1;
        }

        // If steps are required, check if the user has enough steps
        const hasEnoughSteps =
          requiredSteps && badge.progress.stepsDone >= stepsRequired[index];
        const hasMatchingTier =
          requiredTier &&
          badge.progress.achievedTiers.some(
            (tier: any) => tier.tierId === requiredTier
          );

        if (!requiredSteps && requiredTier && hasMatchingTier) {
          // Has required tier, but not required steps
          return count + 1;
        } else if (!requiredTier && requiredSteps && hasEnoughSteps) {
          // Has required steps, but not a required tier
          return count + 1;
        } else if (
          requiredTier &&
          requiredSteps &&
          hasEnoughSteps &&
          hasMatchingTier
        ) {
          // Has required steps, but not a required tier
          return count + 1;
        } else if (!requiredTier && !requiredSteps) {
          // If it's not a tiered badge, count it as achieved
          return count + 1;
        } else {
          return count; // Return the count without incrementing if the badge is not achieved
        }
      }, 0); // Initial value of count is 0
    } catch (error) {
      console.error("Error checking Decentraland badges:", error);
      throw error;
    }
  }
  static async getAllUserBadges(address: string): Promise<Badge[]> {
    try {
      const response = await axios.get<BadgesResponse>(
        `https://badges.decentraland.org/users/${address}/badges`
      );
      return response.data.data.achieved;
    } catch (error) {
      console.error("Error fetching all Decentraland badges:", error);
      throw error;
    }
  }

  static async checkForDecentralandName(address: string): Promise<any | null> {
    try {
      // First, get the owned Decentraland Name NFTs
      const nfts = await alchemy.nft.getNftsForOwner(address, {
        contractAddresses: ["0x2A187453064356c898cAe034EAed119E1663ACb8"], // Decentraland Names contract
      });

      const ownedNames = nfts.ownedNfts
        .filter(
          (nft) =>
            nft.contract.address ===
            "0x2A187453064356c898cAe034EAed119E1663ACb8"
        )
        .map((nft) => nft.name);

      // Then, check the equipped name using Decentraland's API
      const decentralandProfile = await this.getDecentralandProfile(address);

      console.log("Decentraland profile:", decentralandProfile.data);

      const equippedName = decentralandProfile?.name;

      const isDecentralandCitizenWithNameEquipped =
        decentralandProfile &&
        decentralandProfile.hasClaimedName &&
        equippedName &&
        ownedNames.includes(equippedName);

      const isDecentralandCitizenWithName =
        decentralandProfile && ownedNames.length > 0;

      if (isDecentralandCitizenWithNameEquipped) {
        return decentralandProfile;
      } else if (isDecentralandCitizenWithName) {
        return ownedNames[0];
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching Decentraland name:", error);
      return null;
    }
  }

  static async getAllDecentralandNames(
    address: string,
    partialNames?: string[],
    attempts: number = 0
  ): Promise<any | null> {
    try {
      // First, get the owned Decentraland Name NFTs
      const nfts = await alchemy.nft.getNftsForOwner(address, {
        contractAddresses: ["0x2A187453064356c898cAe034EAed119E1663ACb8"], // Decentraland Names contract
      });

      const ownedNames = nfts.ownedNfts
        .filter(
          (nft) =>
            nft.contract.address ===
            "0x2A187453064356c898cAe034EAed119E1663ACb8"
        )
        .map((nft) => nft.name);

      console.log("Owned names:", ownedNames);

      const hasMissingNames = ownedNames.some((name) => !name);

      if (partialNames && partialNames.length > 0 && hasMissingNames) {
        // fill in any missing names
        const missingNames = partialNames.filter(
          (name) => !ownedNames.includes(name)
        );
        ownedNames.push(...missingNames);
      } else if (partialNames && partialNames.length > 0) {
        return ownedNames;
      }

      if (hasMissingNames && attempts < 3) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        attempts++;
        return this.getAllDecentralandNames(address, ownedNames, attempts);
      } else if (hasMissingNames && attempts >= 3) {
        return ownedNames.filter((name) => name);
      } else if (ownedNames.length > 0 && !hasMissingNames) {
        return ownedNames;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching Decentraland name:", error);
      return null;
    }
  }

  static async getDecentralandProfile(address: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://peer.decentraland.org/lambdas/profiles/${address}`
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
  }

  static async getDecentralandRSVPs(address: string): Promise<number> {
    try {
      const response = await axios.get(
        `https://events.decentraland.org/api/events`,
        {
          params: { attendee: address },
        }
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
      throw error;
    }
  }
}
