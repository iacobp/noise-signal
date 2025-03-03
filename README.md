This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy on Netlify

This project is configured for easy deployment on Netlify. Follow these steps:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Sign up or log in to [Netlify](https://www.netlify.com/)
3. Click "Add new site" > "Import an existing project"
4. Connect to your Git provider and select this repository
5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add the following environment variables in the Netlify dashboard:
   - `NEXT_PUBLIC_PERPLEXITY_API_KEY`
   - `NEXT_PUBLIC_EXA_API_KEY`
   - `NEXT_PUBLIC_OPENAI_API_KEY`
7. Click "Deploy site"

The deployment will automatically use the configuration in `netlify.toml` and the Netlify Next.js plugin.
