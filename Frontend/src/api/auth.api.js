import api from "./axios"


export const registerUser = async (
  email,
  password
) => {
  const response = await api.post(
    "/auth/register",
    {
      email,
      password,
    }
  )

  return response.data
}


export const loginUser = async (
  email,
  password
) => {
  const body =
    new URLSearchParams()

  body.append(
    "username",
    email
  )

  body.append(
    "password",
    password
  )

  const response = await api.post(
    "/auth/login",
    body,
    {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
    }
  )

  return response.data
}


export const logoutUser = async () => {
  const response =
    await api.post(
      "/auth/logout"
    )

  return response.data
}


export const getCurrentUser =
  async () => {
    const response =
      await api.get(
        "/users/me"
      )

    return response.data
  }