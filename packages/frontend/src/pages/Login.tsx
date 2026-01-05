import { useNavigate, Link } from 'react-router-dom';
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
import { useEffect } from 'react';

type FormValues = {
  email: string;
  password: string;
};

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error, user } = useAuthStore();

  const form = useForm<FormValues>({
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (user) navigate('/workflow');
  }, [user, navigate]);

  const onSubmit = async (values: FormValues) => {
    const ok = await login(values.email, values.password);
    if (ok) navigate('/workflow');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <Input type="password" placeholder="Your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && <div className="text-destructive text-sm">{error}</div>}

              <div className="flex items-center justify-between">
                <div />
                <Button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="w-full text-sm text-muted-foreground">
            Don't have an account? <Link to="/register" className="text-primary">Register</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;