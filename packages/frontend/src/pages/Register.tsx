import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

type FormValues = {
  first_name?: string;
  email: string;
  password: string;
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: doRegister, loading, error, user } = useAuthStore();

  const form = useForm<FormValues>({
    defaultValues: { first_name: '', email: '', password: '' },
  });

  React.useEffect(() => {
    if (user) navigate('/workflow');
  }, [user, navigate]);

  const onSubmit = async (values: FormValues) => {
    const ok = await doRegister(values.email, values.password, values.first_name);
    if (ok) navigate('/workflow');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                rules={{ required: 'Email is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                rules={{ required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Choose a password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && <div className="text-destructive text-sm">{error}</div>}

              <div className="flex items-center justify-end">
                <Button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Create account'}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="w-full text-sm text-muted-foreground">
            Already have an account? <a href="/login" className="text-primary">Sign in</a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
