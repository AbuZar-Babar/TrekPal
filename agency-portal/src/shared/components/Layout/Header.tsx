import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Thin utility bar — no page title here.
 * Each page owns its own heading via a local h1.
 */
const Header = () => {
  const { user }          = useSelector((state: RootState) => state.auth);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="portal-header">
      <div
        className="portal-header-inner"
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div className="hidden text-xs text-[var(--text-soft)] lg:block">
          Agency workspace
        </div>

        <div className="portal-header-actions">
          <button
            type="button"
            onClick={toggleTheme}
            className="portal-icon-btn h-8 w-8"
            aria-label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          >
            {theme === 'dark' ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M12 3v2.25m0 13.5V21m9-9h-2.25M5.25 12H3m15.114 6.364l-1.591-1.591M7.477 7.477 5.886 5.886m12.228 0-1.591 1.591M7.477 16.523l-1.591 1.591M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M21 12.79A9 9 0 1111.21 3c0 .56.06 1.107.174 1.634A7 7 0 0019.366 12.4c.527.114 1.074.174 1.634.174z" />
              </svg>
            )}
          </button>

          <div className="portal-user-card">
            <div className="portal-avatar">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
            <div className="hidden min-w-0 md:block">
              <div className="truncate text-xs font-semibold tracking-tight text-[var(--text)]">
                {user?.name || 'Agency'}
              </div>
              <div className="truncate text-[10px] text-[var(--text-soft)]">
                {user?.email || 'agency@trekpal.pk'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
