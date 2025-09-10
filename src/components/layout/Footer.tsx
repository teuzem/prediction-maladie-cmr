import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-heading font-bold">EpicTracker</span>
            </div>
            <p className="text-primary-100 text-sm leading-relaxed">
              Révolutionner la santé infantile au Cameroun grâce à l'intelligence artificielle 
              et aux consultations médicales en ligne.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-200 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-200 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-200 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-200 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liens rapides</h3>
            <nav className="space-y-2">
              <Link to="/" className="block text-primary-100 hover:text-white transition-colors text-sm">
                Accueil
              </Link>
              <Link to="/prediction" className="block text-primary-100 hover:text-white transition-colors text-sm">
                Prédiction IA
              </Link>
              <Link to="/doctors" className="block text-primary-100 hover:text-white transition-colors text-sm">
                Nos médecins
              </Link>
              <Link to="/about" className="block text-primary-100 hover:text-white transition-colors text-sm">
                À propos
              </Link>
              <Link to="/contact" className="block text-primary-100 hover:text-white transition-colors text-sm">
                Contact
              </Link>
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <nav className="space-y-2">
              <a href="#" className="block text-primary-100 hover:text-white transition-colors text-sm">
                Diagnostic IA
              </a>
              <a href="#" className="block text-primary-100 hover:text-white transition-colors text-sm">
                Consultation vidéo
              </a>
              <a href="#" className="block text-primary-100 hover:text-white transition-colors text-sm">
                Suivi médical
              </a>
              <a href="#" className="block text-primary-100 hover:text-white transition-colors text-sm">
                Rapports médicaux
              </a>
              <a href="#" className="block text-primary-100 hover:text-white transition-colors text-sm">
                Urgences 24/7
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary-300 flex-shrink-0" />
                <span className="text-primary-100 text-sm">
                  Yaoundé, Cameroun
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary-300 flex-shrink-0" />
                <span className="text-primary-100 text-sm">
                  +237 6 XX XX XX XX
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary-300 flex-shrink-0" />
                <span className="text-primary-100 text-sm">
                  contact@epictracker.cm
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-200 text-sm">
              © {currentYear} EpicTracker. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-primary-200 hover:text-white text-sm transition-colors">
                Confidentialité
              </Link>
              <Link to="/terms" className="text-primary-200 hover:text-white text-sm transition-colors">
                Conditions d'utilisation
              </Link>
              <Link to="/legal" className="text-primary-200 hover:text-white text-sm transition-colors">
                Mentions légales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
