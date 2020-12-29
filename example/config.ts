const user: {
  access_token: string;
  uid: number;
  username: string;
  password: string;
} = {
  access_token: String(process.env.YM_ACCESS_TOKEN),
  uid: Number(process.env.YM_UID),
  username: String(process.env.YM_USERNAME),
  password: String(process.env.YM_PASSWORD),
};

export default {
  user,
};
