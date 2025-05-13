import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface UserProfile {
  email: string;
  full_name: string;
}

interface APIKey {
  id: number;
  provider: string;
  api_key: string;
  is_active: boolean;
}

const profileSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If any password field is filled, all must be filled
      const { currentPassword, newPassword, confirmPassword } = data;
      if (currentPassword || newPassword || confirmPassword) {
        return Boolean(currentPassword && newPassword && confirmPassword);
      }
      return true;
    },
    {
      message: "All password fields are required when changing password",
      path: ["currentPassword"],
    }
  )
  .refine(
    (data) => {
      // Passwords must match
      if (data.newPassword && data.confirmPassword) {
        return data.newPassword === data.confirmPassword;
      }
      return true;
    },
    {
      message: "New passwords do not match",
      path: ["confirmPassword"],
    }
  );

type ProfileFormData = z.infer<typeof profileSchema>;

const apiKeySchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  apiKey: z.string().min(1, "API key is required"),
});

type APIKeyFormData = z.infer<typeof apiKeySchema>;

export default function ProfileSettings() {
  // Mock user data - in a real app, this would come from an API
  const [user, setUser] = useState<UserProfile>({
    email: "user@example.com",
    full_name: "Demo User",
  });

  // Mock API keys - in a real app, these would come from an API
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: 1,
      provider: "flipside",
      api_key: "**********************",
      is_active: true,
    },
    {
      id: 2,
      provider: "helius",
      api_key: "**********************",
      is_active: true,
    },
  ]);

  const [showAddApiKey, setShowAddApiKey] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [apiKeySuccess, setApiKeySuccess] = useState("");
  const [apiKeyError, setApiKeyError] = useState("");

  // Profile form
  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user.full_name,
    },
  });

  // API Key form
  const {
    register: apiKeyRegister,
    handleSubmit: handleApiKeySubmit,
    reset: resetApiKeyForm,
    formState: { errors: apiKeyErrors },
  } = useForm<APIKeyFormData>({
    resolver: zodResolver(apiKeySchema),
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    // Simulate API call to update profile
    setTimeout(() => {
      setUser({
        ...user,
        full_name: data.fullName,
      });

      setProfileSuccess("Profile updated successfully");
      setProfileError("");

      // Clear success message after a delay
      setTimeout(() => setProfileSuccess(""), 3000);
    }, 500);
  };

  const onApiKeySubmit = (data: APIKeyFormData) => {
    // Simulate API call to add API key
    setTimeout(() => {
      const newApiKey: APIKey = {
        id: apiKeys.length + 1,
        provider: data.provider,
        api_key: "**********************", // In real app, we'd send the actual key to the server
        is_active: true,
      };

      setApiKeys([...apiKeys, newApiKey]);
      setShowAddApiKey(false);
      setApiKeySuccess("API key added successfully");
      setApiKeyError("");
      resetApiKeyForm();

      // Clear success message after a delay
      setTimeout(() => setApiKeySuccess(""), 3000);
    }, 500);
  };

  const toggleApiKeyStatus = (id: number) => {
    // Simulate API call to toggle API key status
    setApiKeys(
      apiKeys.map((key) => {
        if (key.id === id) {
          return { ...key, is_active: !key.is_active };
        }
        return key;
      })
    );
  };

  const deleteApiKey = (id: number) => {
    // Simulate API call to delete API key
    setApiKeys(apiKeys.filter((key) => key.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Profile Settings
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Update your profile information and password.
          </p>
        </div>

        {profileSuccess && (
          <div className="bg-green-50 p-4 border-l-4 border-green-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{profileSuccess}</p>
              </div>
            </div>
          </div>
        )}

        {profileError && (
          <div className="bg-red-50 p-4 border-l-4 border-red-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{profileError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  disabled
                  className="mt-1 bg-gray-50 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Email cannot be changed.
                </p>
              </div>

              <div className="col-span-6 sm:col-span-4">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full name
                </label>
                <input
                  type="text"
                  id="fullName"
                  className={`mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                    profileErrors.fullName ? "border-red-300" : ""
                  }`}
                  {...profileRegister("fullName")}
                />
                {profileErrors.fullName && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileErrors.fullName.message}
                  </p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-4">
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  className={`mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                    profileErrors.currentPassword ? "border-red-300" : ""
                  }`}
                  {...profileRegister("currentPassword")}
                />
                {profileErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileErrors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-4">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  New password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className={`mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                    profileErrors.newPassword ? "border-red-300" : ""
                  }`}
                  {...profileRegister("newPassword")}
                />
                {profileErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm new password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className={`mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                    profileErrors.confirmPassword ? "border-red-300" : ""
                  }`}
                  {...profileRegister("confirmPassword")}
                />
                {profileErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileErrors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            API Keys
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage your API keys for different data providers.
          </p>
        </div>

        {apiKeySuccess && (
          <div className="bg-green-50 p-4 border-l-4 border-green-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{apiKeySuccess}</p>
              </div>
            </div>
          </div>
        )}

        {apiKeyError && (
          <div className="bg-red-50 p-4 border-l-4 border-red-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{apiKeyError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Provider
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            API Key
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {apiKeys.map((key) => (
                          <tr key={key.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 capitalize">
                                {key.provider}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {key.api_key}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  key.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {key.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => toggleApiKeyStatus(key.id)}
                                className="text-primary-600 hover:text-primary-900 mr-4"
                              >
                                {key.is_active ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                onClick={() => deleteApiKey(key.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {!showAddApiKey ? (
              <div>
                <button
                  type="button"
                  onClick={() => setShowAddApiKey(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add API Key
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-base font-medium text-gray-900 mb-4">
                  Add New API Key
                </h4>
                <form onSubmit={handleApiKeySubmit(onApiKeySubmit)}>
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="provider"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Provider
                      </label>
                      <select
                        id="provider"
                        className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                          apiKeyErrors.provider ? "border-red-300" : ""
                        }`}
                        {...apiKeyRegister("provider")}
                      >
                        <option value="">Select Provider</option>
                        <option value="flipside">Flipside Crypto</option>
                        <option value="helius">Helius API</option>
                        <option value="bitquery">Bitquery</option>
                        <option value="dune">Dune Analytics</option>
                      </select>
                      {apiKeyErrors.provider && (
                        <p className="mt-1 text-sm text-red-600">
                          {apiKeyErrors.provider.message}
                        </p>
                      )}
                    </div>

                    <div className="col-span-6 sm:col-span-4">
                      <label
                        htmlFor="apiKey"
                        className="block text-sm font-medium text-gray-700"
                      >
                        API Key
                      </label>
                      <input
                        type="password"
                        id="apiKey"
                        className={`mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                          apiKeyErrors.apiKey ? "border-red-300" : ""
                        }`}
                        {...apiKeyRegister("apiKey")}
                      />
                      {apiKeyErrors.apiKey && (
                        <p className="mt-1 text-sm text-red-600">
                          {apiKeyErrors.apiKey.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Save API Key
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddApiKey(false)}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
