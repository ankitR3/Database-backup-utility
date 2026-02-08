import SignInButton from '@/src/components/auth/SignInButton';

export default function Home() {
  return (
    <div className='min-h-screen bg-linear-to-b from-background to-muted'>
      <div className='max-w-4xl mx-auto px-4 py-16'>
        <div className='text-center space-y-8'>
          <h1 className="text-3xl md:text-4xl font-bold">
            DBHaven
          </h1>
          <p className='text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto'>
            Automated Database Backup Scheduler for MongoDb and PostgresSQL
          </p>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12'>
            <div className='p-6 bg-card rounded-lg border'>
              <h3 className='text-xl font-semibold mb-2'>Automated Backups</h3>
              <p className='text-muted-foreground'>Schedule automatic backups for your database</p>
            </div>
            <div className='p-6 bg-card rounded-lg border'>
              <h3 className='text-xl font-semibold mb-2'>Multiple Databases</h3>
              <p className='text-muted-foreground'>Support for MongoDB and PostgresSQL</p>
            </div>
            <div className='p-6 bg-card rounded-lg border'>
              <h3 className='text-xl font-semibold mb-2'>Cloud Storage</h3>
              <p className='text-muted-foreground'>Store backups securely in the cloud</p>
            </div>
          </div>

          <div>
            <SignInButton />
          </div>
        </div>
      </div>
    </div> 
  );
}
