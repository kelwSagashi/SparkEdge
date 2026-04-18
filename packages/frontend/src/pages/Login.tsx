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
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

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
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) navigate('/workflow');
  }, [user, navigate]);

  const onSubmit = async (values: FormValues) => {
    const ok = await login(values.email, values.password);
    if (ok) navigate('/workflow');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <Card className="max-w-md bg-secondary-foreground rounded w-90">
        <CardHeader>
          <CardTitle className='text-primary'>Login</CardTitle>
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
                    <FormLabel className='text-primary'>Email</FormLabel>
                    <FormControl>
                      <Input className='text-muted-foreground' type="email" placeholder="you@example.com" {...field} />
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
                    <FormLabel className='text-primary'>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input className='text-muted-foreground pr-10' type={showPassword ? 'text' : 'password'} placeholder="Your password" {...field} />
                        <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(s => !s)}>
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && <div className="text-destructive text-sm">{error}</div>}

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link to="/#" className="text-muted-foreground">Forgot my password</Link>
                </div>
                <Button type="submit" className='bg-accent-foreground text-primary flex items-center gap-2' disabled={loading}>
                  {loading && <Spinner />} {loading ? 'Logging in...' : 'Login'}
                </Button>
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
