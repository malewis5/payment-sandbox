import { Client, client } from "braintree-web";
import { useEffect, useState } from "react";

type ClientTokenReturnType = {
  token: string | undefined;
  isLoading: boolean;
  serverError: boolean;
  clientInstance: Client | undefined;
};

// React Hook to generate Braintree authorization token
export const GenerateClientToken = (
  endpoint: string
): ClientTokenReturnType => {
  const [token, setToken] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<boolean>(false);
  const [clientInstance, setClientInstance] = useState<Client>();

  useEffect(() => {
    console.log("Fetched instance");
    setIsLoading(true);
    const fetchToken = async () => {
      try {
        await fetch(endpoint)
          .then((res) => res.json())
          .then((data) => {
            setToken(data.token);
            return data.token;
          })
          .then(async (token) => await authenticateInstance(token))
          .then(async (instance) => {
            setClientInstance(instance);
          })
          .catch((err: Error) => {
            setServerError(true);
            throw new Error(err.message);
          })
          .finally(() => setIsLoading(false));
      } catch (e: any) {
        setServerError(true);
        setIsLoading(false);
        throw Error(e.message);
      }
    };

    // Authenticate Braintree client-side SDK
    const authenticateInstance = async (token: string) => {
      try {
        const clientInstance = await client
          .create({
            authorization: token ?? "",
          })
          .then((instance: Client) => {
            return instance;
          });
        return clientInstance;
      } catch (e: any) {
        throw new Error(e);
      }
    };

    fetchToken();
  }, [endpoint]);

  return { token, isLoading, serverError, clientInstance };
};
