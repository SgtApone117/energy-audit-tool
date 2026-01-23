import { Shield, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>100% Anonymous</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-4 h-4" />
              <span>Data stays on your device</span>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <span>Powered by</span>
            <a
              href="https://www.asaptechsys.com/clients"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1.5 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ASAP Tech Systems
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
