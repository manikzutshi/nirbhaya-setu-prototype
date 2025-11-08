export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto max-w-7xl px-6 py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {/* Brand Section */}
        <aside className="sm:col-span-2 lg:col-span-2 pr-4">
          <a href="/" className="text-2xl font-semibold text-gray-900">
            Nirbhaya <span className="text-primary">Setu</span>
          </a>
          <p className="mt-4 text-sm text-gray-500 leading-relaxed">
            Empowering women and securing communities through technology, AI, and community trust.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Built by Team Dead Poets'
          </p>
        </aside>

        {/* Product Links */}
        <nav>
          <h6 className="font-semibold text-gray-900 uppercase tracking-wider text-sm">Product</h6>
          <ul className="mt-4 space-y-3">
            <li><a href="#features" className="link link-hover text-gray-600">Features</a></li>
            <li><a href="#impact" className="link link-hover text-gray-600">Impact</a></li>
            <li><a href="#campus" className="link link-hover text-gray-600">Campus Secure</a></li>
          </ul>
        </nav>

        {/* Company Links */}
        <nav>
          <h6 className="font-semibold text-gray-900 uppercase tracking-wider text-sm">Company</h6>
          <ul className="mt-4 space-y-3">
            <li><a href="#about" className="link link-hover text-gray-600">About Us</a></li>
            <li><a href="#team" className="link link-hover text-gray-600">Team</a></li>
            <li><a href="#contact" className="link link-hover text-gray-600">Contact</a></li>
          </ul>
        </nav>

        {/* Social Media Section */}
        <nav>
          <h6 className="font-semibold text-gray-900 uppercase tracking-wider text-sm">Connect</h6>
          <div className="mt-4 flex items-center gap-4">
            <a
              href="https://twitter.com/nirbhayasetu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nirbhaya Setu on Twitter"
              className="text-gray-500 hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 256 256">
                <path d="M214.75,211.71l-62.6-98.38,61.77-67.95a6,6,0,0,0-8.84-8.08L143.24,99.08,102.75,36.29A6,6,0,0,0,97.78,34H48a6,6,0,0,0-5,9.29l62.6,98.38L43.83,209.62a6,6,0,1,0,8.84,8.08l61.84-68L156,218.71A6,6,0,0,0,161,221h49.73a6,6,0,0,0,5-9.29ZM158.24,209,103.15,130.86,56.15,46h37.61l55.1,78.14L196.85,209Z"></path>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/nirbhayasetu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nirbhaya Setu on Instagram"
              className="text-gray-500 hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 256 256">
                <path d="M128,82a46,46,0,1,0,46,46A46.06,46.06,0,0,0,128,82Zm0,80a34,34,0,1,1,34-34A34,34,0,0,1,128,162ZM176,26H80A54.06,54.06,0,0,0,26,80v96a54.06,54.06,0,0,0,54,54h96a54.06,54.06,0,0,0,54-54V80A54.06,54.06,0,0,0,176,26Zm42,150a42,42,0,0,1-42,42H80a42,42,0,0,1-42-42V80A42,42,0,0,1,80,38h96a42,42,0,0,1,42,42ZM190,76a10,10,0,1,1-10-10A10,10,0,0,1,190,76Z"></path>
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/nirbhayasetu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nirbhaya Setu on LinkedIn"
              className="text-gray-500 hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 256 256">
                <path d="M216,26H40A14,14,0,0,0,26,40V216a14,14,0,0,0,14,14H216a14,14,0,0,0,14-14V40A14,14,0,0,0,216,26Zm2,190a2,2,0,0,1-2,2H40a2,2,0,0,1-2-2V40a2,2,0,0,1,2-2H216a2,2,0,0,1,2,2ZM94,112v64a6,6,0,0,1-12,0V112a6,6,0,0,1,12,0Zm88,28v36a6,6,0,0,1-12,0V140a22,22,0,0,0-44,0v36a6,6,0,0,1-12,0V112a6,6,0,0,1,12,0v2.11A34,34,0,0,1,182,140ZM100,84A10,10,0,1,1,90,74,10,10,0,0,1,100,84Z"></path>
              </svg>
            </a>
          </div>
        </nav>
      </div>

      {/* Bottom Bar with Copyright */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto max-w-7xl px-6 py-4 text-center text-sm text-gray-500">
          Copyright © {currentYear} Nirbhaya Setu - Team Aura Farmers. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
