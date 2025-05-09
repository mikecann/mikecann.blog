export const validateBlogPostAdminToken = (token: string) => {
  console.log("token", token);
  console.log("process.env.BLOG_POST_ADMIN_TOKEN", process.env.BLOG_POST_ADMIN_TOKEN);
  if (token != process.env.BLOG_POST_ADMIN_TOKEN)
    throw new Error("Invalid token does not match env var BLOG_POST_ADMIN_TOKEN");
};
