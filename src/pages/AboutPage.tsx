import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Brain, Users, Award, Target, Shield, Globe, Stethoscope } from 'lucide-react'

export function AboutPage() {
  const features = [
    {
      icon: Brain,
      title: 'Intelligence Artificielle Avancée',
      description: 'Notre IA analyse plus de 20 maladies infantiles avec une précision de 95% grâce aux données du MINSANTE et de l\'OMS.'
    },
    {
      icon: Stethoscope,
      title: 'Médecins Vérifiés',
      description: 'Tous nos médecins sont agréés par le MINSANTE et spécialisés dans la pédiatrie et les maladies tropicales.'
    },
    {
      icon: Shield,
      title: 'Sécurité Maximale',
      description: 'Vos données médicales sont cryptées et protégées selon les standards internationaux de sécurité.'
    },
    {
      icon: Globe,
      title: 'Accessible Partout',
      description: 'Consultez depuis n\'importe où au Cameroun grâce à notre plateforme de télémédecine.'
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Enfants protégés' },
    { number: '50+', label: 'Médecins vérifiés' },
    { number: '95%', label: 'Précision IA' },
    { number: '24/7', label: 'Support disponible' }
  ]

  const team = [
    {
      name: 'Dr. Marie Kouam',
      role: 'Directrice Médicale',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
      bio: 'Pédiatre avec 15 ans d\'expérience, spécialisée en maladies tropicales.'
    },
    {
      name: 'Jean-Baptiste Nko',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
      bio: 'Expert en IA médicale avec une passion pour l\'innovation en santé.'
    },
    {
      name: 'Dr. Paul Mbarga',
      role: 'Conseiller Médical',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
      bio: 'Ancien directeur du service pédiatrique de l\'Hôpital Général de Yaoundé.'
    }
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-6xl font-heading font-bold mb-6">
              À propos d'EpicTracker
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
              Nous révolutionnons la santé infantile au Cameroun en combinant 
              intelligence artificielle et expertise médicale pour sauver des vies.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-6">
                Notre mission
              </h2>
              <p className="text-lg text-secondary-600 leading-relaxed mb-6">
                EpicTracker a été créé avec une mission claire : réduire la mortalité infantile 
                au Cameroun en démocratisant l'accès aux soins de santé de qualité grâce à 
                la technologie.
              </p>
              <p className="text-lg text-secondary-600 leading-relaxed mb-8">
                Notre plateforme utilise l'intelligence artificielle pour détecter précocement 
                les maladies infantiles et connecte les familles avec des médecins spécialistes 
                vérifiés, où qu'elles se trouvent au Cameroun.
              </p>
              <div className="flex items-center space-x-4">
                <Target className="w-8 h-8 text-primary-600" />
                <span className="text-lg font-semibold text-secondary-900">
                  Objectif : 0 décès évitable d'enfant
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
                alt="Enfants camerounais en consultation médicale"
                className="w-full h-[400px] object-cover rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent rounded-2xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              Notre impact en chiffres
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Depuis notre lancement, nous avons déjà sauvé des milliers de vies
            </p>
          </motion.div>

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
                <div className="text-4xl lg:text-5xl font-bold text-primary-600 mb-2">
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
              Ce qui nous rend uniques
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              EpicTracker combine technologie de pointe et expertise médicale locale 
              pour offrir des solutions adaptées au contexte camerounais
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 p-6 bg-secondary-50 rounded-xl"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-secondary-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
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
              Notre équipe d'experts
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Des professionnels passionnés qui travaillent chaque jour pour améliorer 
              la santé des enfants camerounais
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-secondary-600 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
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
              Notre impact au Cameroun
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              EpicTracker transforme l'accès aux soins de santé infantile dans tout le pays
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
                alt="Carte du Cameroun avec impact EpicTracker"
                className="w-full h-[400px] object-cover rounded-2xl shadow-xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Accès universel
                  </h3>
                  <p className="text-secondary-600">
                    Nos services sont disponibles dans toutes les 10 régions du Cameroun, 
                    permettant aux familles rurales d'accéder aux mêmes soins que celles des villes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Reconnaissance officielle
                  </h3>
                  <p className="text-secondary-600">
                    EpicTracker est officiellement reconnu par le MINSANTE comme un outil 
                    innovant pour améliorer la santé infantile au Cameroun.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Prévention efficace
                  </h3>
                  <p className="text-secondary-600">
                    Grâce à notre IA, nous avons permis la détection précoce de milliers 
                    de cas, évitant des complications graves et sauvant des vies.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
