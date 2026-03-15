import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCourses } from '../api/api';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ icon, value, label, color }) => (
  <div className="card p-6 flex items-center gap-4 animate-slide-up">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-display font-bold text-white">{value}</p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState([]);

  useEffect(() => {
    getCourses().then(res => setFeaturedCourses(res.data.courses?.slice(0, 3) || []));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-purple/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-cyan/5 rounded-full blur-3xl" />
        </div>

        <div className="page-container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary-500/30 text-primary-400 text-sm font-medium mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              🎓 The Future of Online Learning
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6 animate-slide-up">
              Learn Without{' '}
              <span className="text-gradient">Limits.</span>
              <br />
              Grow Without{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-pink">Boundaries.</span>
            </h1>

            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in">
              Master in-demand skills with expert-led courses. Learn programming, data science,
              design, and more — at your own pace, on any device.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              {user ? (
                <Link to="/courses" className="btn-primary text-base px-8 py-3.5">
                  Browse Courses →
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn-primary text-base px-8 py-3.5">
                    Start Learning Free
                  </Link>
                  <Link to="/courses" className="btn-secondary text-base px-8 py-3.5">
                    Explore Courses
                  </Link>
                </>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-500 animate-fade-in">
              {['✅ Free enrollment', '🎥 YouTube-powered videos', '📱 Mobile friendly', '🏆 Track your progress'].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/5">
        <div className="page-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="📚" value="50+" label="Expert Courses" color="bg-primary-600/20" />
            <StatCard icon="👨‍🎓" value="10K+" label="Active Students" color="bg-accent-purple/20" />
            <StatCard icon="🎓" value="25+" label="Instructors" color="bg-accent-cyan/20" />
            <StatCard icon="⭐" value="4.8" label="Average Rating" color="bg-yellow-500/20" />
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20">
        <div className="page-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary-400 text-sm font-medium mb-2">✦ Featured</p>
              <h2 className="section-title">Top Courses</h2>
            </div>
            <Link to="/courses" className="btn-secondary text-sm px-5 py-2">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-white/5">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Why Learners Choose <span className="text-gradient">LearnFlow</span></h2>
            <p className="text-gray-400 max-w-xl mx-auto">Everything you need to accelerate your learning journey and land your dream career.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🎥',
                color: 'from-primary-600 to-primary-400',
                title: 'YouTube-Powered Videos',
                desc: 'Access high-quality video lessons embedded directly from YouTube — no downloads needed.',
              },
              {
                icon: '📊',
                color: 'from-accent-purple to-accent-pink',
                title: 'Progress Tracking',
                desc: 'Monitor your learning journey with visual progress bars and lesson completion status.',
              },
              {
                icon: '🔐',
                color: 'from-accent-cyan to-primary-500',
                title: 'Secure Authentication',
                desc: 'JWT-based auth with role-based access for students, instructors, and admins.',
              },
              {
                icon: '📱',
                color: 'from-accent-emerald to-accent-cyan',
                title: 'Fully Responsive',
                desc: 'Seamless experience across desktop, tablet, and mobile devices.',
              },
              {
                icon: '🔖',
                color: 'from-accent-orange to-yellow-400',
                title: 'Resume Learning',
                desc: 'Pick up right where you left off — we track your last watched lesson automatically.',
              },
              {
                icon: '🏆',
                color: 'from-yellow-400 to-accent-orange',
                title: 'Instructor Dashboard',
                desc: 'Powerful tools for instructors to create and manage courses with YouTube integration.',
              },
            ].map((feature) => (
              <div key={feature.title} className="card card-hover p-6 animate-slide-up">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-20">
          <div className="page-container">
            <div className="relative card overflow-hidden p-12 text-center">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-accent-purple/10 to-accent-pink/20" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-4xl font-display font-bold text-white mb-4">
                  Ready to Start Your <span className="text-gradient">Learning Journey?</span>
                </h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                  Join thousands of learners already advancing their careers with LearnFlow.
                </p>
                <Link to="/signup" className="btn-primary text-base px-10 py-4 inline-block">
                  Get Started for Free 🚀
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="page-container text-center text-gray-500 text-sm">
          <p>© 2024 <span className="text-gradient font-semibold">LearnFlow</span>. Built with ❤️ using MERN Stack.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
