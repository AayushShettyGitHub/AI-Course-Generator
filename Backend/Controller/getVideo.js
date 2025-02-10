exports.getVideo = async (req, res) => {
    try {
      const { title } = req.query;
  
      if (!title) {
        return res.status(400).json({ error: 'Title query parameter is required' });
      }
  
  
      const youtubeSearchUrl = `https://www.googleapis.com/youtube/v3/search?key=${youtubeKey}&q=${title} trailer&type=video&part=snippet&maxResults=1`;
      const youtubeResponse = await axios.get(youtubeSearchUrl);
  
     
      if (youtubeResponse.data.items.length > 0) {
        const trailerUrl = `https://www.youtube.com/watch?v=${youtubeResponse.data.items[0].id.videoId}`;
        return res.json({ trailerUrl });
      } else {
        return res.status(404).json({ error: 'Trailer not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch trailer' });
    }
  };
  