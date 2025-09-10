import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface GiphyPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

interface Gif {
  id: string;
  images: {
    fixed_height: {
      url: string;
    };
  };
  title: string;
}

export function GiphyPicker({ onSelect, onClose }: GiphyPickerProps) {
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const giphyApiKey = import.meta.env.VITE_GIPHY_API_KEY;

  useEffect(() => {
    fetchGifs();
  }, [searchTerm]);

  const fetchGifs = async () => {
    setLoading(true);
    if (!giphyApiKey || giphyApiKey === 'YOUR_API_KEY') {
      toast.error("Clé API Giphy non configurée.");
      setLoading(false);
      return;
    }

    const endpoint = searchTerm
      ? `https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${encodeURIComponent(searchTerm)}&limit=20`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${giphyApiKey}&limit=20`;

    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      setGifs(data.data);
    } catch (error) {
      console.error("Error fetching GIFs from Giphy:", error);
      toast.error("Erreur lors du chargement des GIFs.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGif = (gif: Gif) => {
    onSelect(gif.images.fixed_height.url);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-20 left-4 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col border border-secondary-200"
    >
      <div className="p-3 border-b border-secondary-200 flex items-center justify-between">
        <h3 className="font-semibold text-secondary-800">Choisir un GIF</h3>
        <button onClick={onClose} className="p-1 hover:bg-secondary-100 rounded-full">
          <X className="w-4 h-4 text-secondary-600" />
        </button>
      </div>
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher des GIFs..."
            className="w-full pl-8 pr-3 py-1.5 border border-secondary-300 rounded-md text-sm focus:ring-1 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <motion.div
                key={gif.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleSelectGif(gif)}
                className="cursor-pointer rounded overflow-hidden"
              >
                <img src={gif.images.fixed_height.url} alt={gif.title} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
