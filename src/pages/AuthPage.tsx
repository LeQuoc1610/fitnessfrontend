import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';

export function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center gym-gradient px-4">
      <div className="grid w-full max-w-4xl gap-8 md:grid-cols-2 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-muted">
            Lift. Track. Connect.
          </div>
          <h1 className="font-display text-3xl md:text-4xl tracking-wide text-neon-blue">
            Welcome to GymBro
          </h1>
          <p className="text-sm text-muted">
            Nơi kết nối những người đam mê thể hình, giúp bạn theo dõi tiến trình tập luyện và đạt được mục tiêu sức khỏe của mình.
          </p>
        </div>
        <div className="card-neon p-6 space-y-6">
          <LoginForm />
          <div className="h-px bg-border/60" />
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
