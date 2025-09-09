# IPTV Streaming Platform

A modern, responsive IPTV streaming platform built with Next.js 15, featuring live TV channels from around the world with advanced video streaming capabilities.

## 🚀 Features

### 📺 Channel Management
- **Extensive Channel Library**: Access to thousands of live TV channels worldwide
- **Smart Filtering**: Filter channels by country, category, and language
- **Real-time Search**: Search channels by name, country, or category
- **Pagination**: Efficient browsing with paginated channel listings
- **Initial Curated Selection**: Bangladeshi and Sports channels featured by default

### 🎥 Advanced Video Player
- **HLS Streaming Support**: Full support for HTTP Live Streaming (HLS) with hls.js
- **Multiple Format Support**: Handles .m3u8, .ts, and direct HTTP streams
- **Adaptive Quality**: Automatic quality selection (1080p → 720p → 480p fallback)
- **Custom Controls**: Play/pause, volume control, seek bar, and fullscreen
- **Error Recovery**: Automatic retry mechanisms for failed streams
- **Cross-Origin Support**: CORS-enabled for international streams

### 🎨 User Interface
- **Modern Dark Theme**: Sleek gray/blue color scheme optimized for viewing
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Channel Cards**: Beautiful grid layout with logos and metadata
- **Related Channels**: Smart recommendations based on category and country
- **Loading States**: Smooth loading animations and error handling

### 🔧 Technical Features
- **API Integration**: Real-time data from iptv-org GitHub API
- **Caching System**: 5-minute cache for optimal performance
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom components
- **Next.js 15**: Latest features including Turbopack for fast development

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Video Streaming**: hls.js, Video.js, React Player
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Development**: ESLint, Turbopack

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd iptv
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Build and Deploy

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run lint         # Run ESLint
```

### Production
```bash
npm run build        # Build for production with Turbopack
npm run start        # Start production server
```

### Deploy on Vercel
The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Deploy with zero configuration

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page with channel grid
│   └── watch/
│       └── [id]/
│           └── page.tsx     # Individual channel watch page
├── components/
│   └── VideoPlayer.tsx      # Custom video player component
└── services/
    └── iptvApi.ts           # API service for IPTV data
```

## 🔌 API Integration

The application integrates with the [iptv-org](https://github.com/iptv-org/iptv) API to provide:

- **Channels**: Live TV channel information and metadata
- **Streams**: Direct streaming URLs for each channel
- **Countries**: Country-specific channel filtering
- **Categories**: Genre-based channel organization

### Data Sources
- `https://iptv-org.github.io/api/channels.json`
- `https://iptv-org.github.io/api/streams.json`
- `https://iptv-org.github.io/api/countries.json`
- `https://iptv-org.github.io/api/categories.json`

## 🎯 Usage

### Browsing Channels
1. **Home Page**: Browse curated Bangladeshi and Sports channels
2. **Search**: Use the search bar to find specific channels
3. **Filter**: Apply country and category filters
4. **Show All**: View the complete channel library

### Watching Streams
1. **Click any channel** to start watching
2. **Use video controls** for playback management
3. **View channel info** for detailed metadata
4. **Browse related channels** in the sidebar

## 🔧 Configuration

### Environment Variables
No environment variables required - the app uses public APIs.

### Customization
- **Initial Filters**: Modify `getInitialChannels()` in `iptvApi.ts`
- **Styling**: Update Tailwind classes or `globals.css`
- **Player Settings**: Configure video player options in `VideoPlayer.tsx`

## 🐛 Troubleshooting

### Common Issues

1. **Stream Not Playing**:
   - Check browser console for HLS errors
   - Verify stream URL is accessible
   - Try different quality streams

2. **CORS Errors**:
   - Some streams may have CORS restrictions
   - Use a CORS proxy if needed for development

3. **Performance Issues**:
   - Clear API cache: `iptvApi.clearCache()`
   - Reduce page size in pagination

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.
