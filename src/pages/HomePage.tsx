import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Brain, Video, Shield, Users, Star, CheckCircle, Heart, Award, Clock } from 'lucide-react'

export function HomePage() {
  const features = [
    {
      icon: Brain,
      title: 'IA Avancée',
      description: 'Notre système d\'intelligence artificielle analyse plus de 20 maladies infantiles courantes au Cameroun avec une précision de 95%.'
    },
    {
      icon: Video,
      title: 'Consultation Vidéo',
      description: 'Consultez des médecins spécialistes vérifiés par vidéoconférence depuis le confort de votre domicile.'
    },
    {
      icon: Shield,
      title: 'Sécurisé',
      description: 'Toutes vos données médicales sont cryptées et protégées selon les standards internationaux de sécurité.'
    },
    {
      icon: Users,
      title: 'Médecins Vérifiés',
      description: 'Nos médecins sont agréés par le MINSANTE et spécialisés dans la pédiatrie et les maladies tropicales.'
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Enfants protégés' },
    { number: '50+', label: 'Médecins vérifiés' },
    { number: '95%', label: 'Précision IA' },
    { number: '24/7', label: 'Support disponible' }
  ]

  const testimonials = [
    {
      name: 'Marie Nguema',
      location: 'Yaoundé',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80',
      content: 'EpicTracker a sauvé la vie de ma fille. Le diagnostic précoce du paludisme nous a permis de réagir rapidement.',
      rating: 5
    },
    {
      name: 'Dr. Paul Mboma',
      location: 'Douala',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80',
      content: 'En tant que pédiatre, je recommande EpicTracker pour son approche innovante et sa précision diagnostique.',
      rating: 5
    },
    {
      name: 'Fatima Alhadji',
      location: 'Garoua',
      image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80',
      content: 'Grâce à EpicTracker, j\'ai pu consulter un spécialiste depuis Garoua. Très pratique pour nous en région.',
      rating: 5
    }
  ]

  const diseases = [
    'Paludisme', 'Diarrhée', 'Pneumonie', 'Rougeole', 'Méningite',
    'Coqueluche', 'Dengue', 'Typhoïde', 'Hépatite A', 'Gastro-entérite'
  ]

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-heading font-bold leading-tight">
                  Protégez vos enfants avec l'
                  <span className="text-primary-200">IA médicale</span>
                </h1>
                <p className="text-xl text-primary-100 leading-relaxed">
                  EpicTracker utilise l'intelligence artificielle pour détecter précocement 
                  les maladies infantiles au Cameroun et vous connecte avec des médecins spécialistes.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/prediction"
                  className="inline-flex items-center px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all duration-200 shadow-lg group"
                >
                  Diagnostic gratuit
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-primary-700 transition-all duration-200"
                >
                  En savoir plus
                </Link>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <Award className="w-6 h-6 text-primary-200" />
                  <span className="text-primary-100">Agréé MINSANTE</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-primary-200" />
                  <span className="text-primary-100">100% Sécurisé</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
                  alt="Enfants camerounais souriants en bonne santé"
                  className="w-full h-[400px] lg:h-[500px] object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent rounded-2xl"></div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-400 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -top-6 -right-6 w-40 h-40 bg-primary-300 rounded-full blur-3xl opacity-30"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-secondary-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              Pourquoi choisir EpicTracker ?
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Notre plateforme combine technologie de pointe et expertise médicale 
              pour offrir les meilleurs soins à vos enfants.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Diseases Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              Maladies détectées par notre IA
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Notre système peut identifier plus de 20 maladies infantiles 
              courantes au Cameroun avec une précision exceptionnelle.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {diseases.map((disease, index) => (
              <motion.div
                key={disease}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-primary-50 border border-primary-100 rounded-lg p-4 text-center hover:bg-primary-100 transition-colors cursor-pointer"
              >
                <CheckCircle className="w-5 h-5 text-primary-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-primary-800">{disease}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Un processus simple et efficace pour prendre soin de la santé de vos enfants.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Diagnostic IA',
                description: 'Renseignez les symptômes de votre enfant dans notre interface intuitive. Notre IA analyse et prédit la maladie.',
                icon: Brain
              },
              {
                step: '2',
                title: 'Consultation',
                description: 'Prenez rendez-vous avec un médecin spécialiste pour confirmer le diagnostic et recevoir un traitement.',
                icon: Video
              },
              {
                step: '3',
                title: 'Suivi',
                description: 'Recevez votre rapport médical complet et bénéficiez d\'un suivi personnalisé de votre enfant.',
                icon: Heart
              }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="relative mb-8">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center text-primary-800 font-bold text-sm">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-secondary-600 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Des milliers de familles camerounaises nous font confiance pour la santé de leurs enfants.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-primary-50 border border-primary-100 rounded-2xl p-8"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-secondary-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-secondary-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-secondary-600">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-white space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-heading font-bold">
                Prêt à protéger votre enfant ?
              </h2>
              <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                Commencez dès maintenant avec un diagnostic gratuit par IA 
                et accédez à nos médecins spécialistes en quelques clics.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/register"
                className="inline-flex items-center px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all duration-200 shadow-lg group"
              >
                Créer un compte gratuit
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/prediction"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-primary-700 transition-all duration-200"
              >
                Essayer le diagnostic IA
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary-200" />
                <span className="text-primary-100">Support 24/7</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary-200" />
                <span className="text-primary-100">Données sécurisées</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary-200" />
                <span className="text-primary-100">Médecins certifiés</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
