import { Layout } from '../components/Layout';

export default function Dashboard() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground mb-4">Dashboard</h1>
        <p className="text-gray-500 dark:text-muted-foreground max-w-md">
          Welcome to the AI Hub Dashboard. This area is currently under construction.
          Please visit "My Repos" to manage your repositories.
        </p>
      </div>
    </Layout>
  );
}
