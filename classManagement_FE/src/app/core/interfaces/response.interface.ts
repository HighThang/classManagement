export interface AuthResponse {
  accessToken: string;
  tokenType: string;
}

export interface UserResponse {
  email: string, 
  role: string,
  dob: string,
  firstName: string,
  surname: string,
  lastName: string,
  phone: string
}