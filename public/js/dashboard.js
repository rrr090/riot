fetch('/api/me')
.then(response => {
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
})
.then(data => {
  const profileHTML = `
    <img src="${data.images[0]?.url || '/api/placeholder/100/100'}" alt="Profile" class="profile-img">
    <div class="user-info">
      <h1>${data.display_name}</h1>
      <p>${data.followers.total} followers • ${data.country}</p>
      <p>${data.email || ''}</p>
    </div>
  `;
  document.getElementById('profile').innerHTML = profileHTML;
})
.catch(error => {
  console.error('Error:', error);
  document.getElementById('profile').innerHTML = '<p>Failed to load profile. Please try again.</p>';
});

// Fetch and display top tracks
fetch('/api/top-tracks')
.then(response => {
  if (!response.ok) throw new Error('Failed to fetch top tracks');
  return response.json();
})
.then(data => {
  const tracksHTML = `
    <div class="track-list">
      ${data.items.map(track => `
        <div class="track-card">
          <img src="${track.album.images[0]?.url || '/api/placeholder/180/180'}" alt="${track.name}" class="card-img">
          <div class="card-content">
            <h3 class="card-title">${track.name}</h3>
            <p class="card-subtitle">${track.artists[0].name}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  document.getElementById('top-tracks').innerHTML = tracksHTML;
})
.catch(error => {
  console.error('Error:', error);
  document.getElementById('top-tracks').innerHTML = '<p>Failed to load top tracks. Please try again.</p>';
});

// Fetch and display playlists
fetch('/api/playlists')
.then(response => {
  if (!response.ok) throw new Error('Failed to fetch playlists');
  return response.json();
})
.then(data => {
  const playlistsHTML = `
    <div class="playlist-list">
      ${data.items.map(playlist => `
        <div class="playlist-card">
          <img src="${playlist.images[0]?.url || '/api/placeholder/180/180'}" alt="${playlist.name}" class="card-img">
          <div class="card-content">
            <h3 class="card-title">${playlist.name}</h3>
            <p class="card-subtitle">${playlist.tracks.total} tracks</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  document.getElementById('playlists').innerHTML = playlistsHTML;
})
.catch(error => {
  console.error('Error:', error);
  document.getElementById('playlists').innerHTML = '<p>Failed to load playlists. Please try again.</p>';
});