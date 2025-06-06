import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
  Tooltip,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Badge
} from '@mui/material';
import {
  PhotoLibrary as GalleryIcon,
  Adjust as AdjustIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  Flip as FlipIcon,
  CenterFocusStrong as PanIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  AddComment as AnnotateIcon,
  Compare as CompareIcon,
  Straighten as MeasureIcon,
  FilterCenterFocus as WindowLevelIcon,
  History as HistoryIcon,
  Bookmark as BookmarkIcon,
  NoteAdd as NoteIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

const DICOMViewer = ({ studyId, onClose }) => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [imageIds, setImageIds] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewportSettings, setViewportSettings] = useState({
    invert: false,
    hflip: false,
    vflip: false,
    rotation: 0,
    zoom: 1,
    wl: { center: 40, width: 400 } // Window level
  });
  const [activeTool, setActiveTool] = useState('pan');
  const [measurements, setMeasurements] = useState([]);
  const [series, setSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [openAnnotationDialog, setOpenAnnotationDialog] = useState(false);
  const [annotationText, setAnnotationText] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const viewportRef = useRef(null);

  // Mock study data
  const mockStudy = {
    patientName: 'John Doe',
    patientId: '12345',
    studyDate: '2023-06-15',
    studyDescription: 'CT ABDOMEN W CONTRAST',
    series: [
      {
        seriesNumber: 1,
        modality: 'CT',
        seriesDescription: 'AXIAL',
        instances: 120,
        thumbnail: 'ct_axial_thumb.jpg'
      },
      {
        seriesNumber: 2,
        modality: 'CT',
        seriesDescription: 'CORONAL',
        instances: 80,
        thumbnail: 'ct_coronal_thumb.jpg'
      },
      {
        seriesNumber: 3,
        modality: 'CT',
        seriesDescription: 'SAGITTAL',
        instances: 80,
        thumbnail: 'ct_sagittal_thumb.jpg'
      }
    ]
  };

  // Simulate loading DICOM study
  useEffect(() => {
    const loadStudy = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from a PACS server
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Set mock data
        const mockImageIds = Array.from({ length: 120 }, (_, i) => 
          `wadouri:https://example.com/dicom/${studyId}/image${i + 1}.dcm`
        );
        
        setImageIds(mockImageIds);
        setSeries(mockStudy.series);
        setSelectedSeries(mockStudy.series[0]);
      } catch (error) {
        console.error('Error loading study:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (studyId) {
      loadStudy();
    }
  }, [studyId]);

  // Tool handlers
  const handleToolChange = (tool) => {
    setActiveTool(tool);
    // In a real app, we would activate the tool in Cornerstone
    console.log(`Active tool set to: ${tool}`);
  };

  // Viewport manipulation handlers
  const handleViewportAction = (action) => {
    switch (action) {
      case 'zoomIn':
        setViewportSettings(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 5) }));
        break;
      case 'zoomOut':
        setViewportSettings(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.5) }));
        break;
      case 'rotateLeft':
        setViewportSettings(prev => ({ ...prev, rotation: prev.rotation - 90 }));
        break;
      case 'rotateRight':
        setViewportSettings(prev => ({ ...prev, rotation: prev.rotation + 90 }));
        break;
      case 'hflip':
        setViewportSettings(prev => ({ ...prev, hflip: !prev.hflip }));
        break;
      case 'vflip':
        setViewportSettings(prev => ({ ...prev, vflip: !prev.vflip }));
        break;
      case 'invert':
        setViewportSettings(prev => ({ ...prev, invert: !prev.invert }));
        break;
      case 'reset':
        setViewportSettings({
          invert: false,
          hflip: false,
          vflip: false,
          rotation: 0,
          zoom: 1,
          wl: { center: 40, width: 400 }
        });
        break;
      default:
        break;
    }
  };

  // Window level adjustment
  const handleWindowLevelChange = (type, value) => {
    setViewportSettings(prev => ({
      ...prev,
      wl: {
        ...prev.wl,
        [type]: value
      }
    }));
  };

  // Measurement handlers
  const handleAddMeasurement = () => {
    const newMeasurement = {
      id: `meas-${Date.now()}`,
      type: 'length',
      value: `${Math.round(Math.random() * 100)} mm`,
      location: 'Liver lesion',
      description: 'Measurement taken at largest diameter',
      timestamp: new Date().toISOString()
    };
    setMeasurements([...measurements, newMeasurement]);
  };

  // Bookmark handlers
  const handleAddBookmark = () => {
    const newBookmark = {
      id: `bm-${Date.now()}`,
      imageIndex: currentImageIndex,
      series: selectedSeries.seriesNumber,
      note: `Bookmark at slice ${currentImageIndex}`,
      timestamp: new Date().toISOString()
    };
    setBookmarks([...bookmarks, newBookmark]);
  };

  // Navigation handlers
  const handleImageNavigation = (direction) => {
    if (direction === 'prev' && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (direction === 'next' && currentImageIndex < imageIds.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  // Annotation dialog handlers
  const handleAnnotationSubmit = () => {
    if (annotationText.trim()) {
      const newAnnotation = {
        id: `ann-${Date.now()}`,
        text: annotationText,
        position: { x: 50, y: 50 }, // Mock position
        timestamp: new Date().toISOString()
      };
      // In a real app, we would store the annotation
      console.log('Annotation added:', newAnnotation);
      setOpenAnnotationDialog(false);
      setAnnotationText('');
    }
  };

  // Series selection handler
  const handleSeriesSelect = (series) => {
    setSelectedSeries(series);
    setCurrentImageIndex(0);
    // In a real app, we would load the new series images
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with study info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h6" component="h2">
            {mockStudy.studyDescription}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {mockStudy.patientName} (ID: {mockStudy.patientId}) | {mockStudy.studyDate}
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Close viewer">
            <IconButton onClick={onClose} size="large">
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {/* Left sidebar - Series selection and thumbnails */}
        <Grid item xs={12} md={3}>
          <Box sx={{ 
            borderRight: { md: '1px solid #e0e0e0' },
            pr: { md: 2 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Tabs 
              value={showBookmarks ? 1 : 0} 
              onChange={(e, newValue) => setShowBookmarks(newValue === 1)}
              sx={{ mb: 2 }}
            >
              <Tab label="Series" />
              <Tab label={
                <Badge badgeContent={bookmarks.length} color="primary">
                  Bookmarks
                </Badge>
              } />
            </Tabs>

            {showBookmarks ? (
              <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Saved Bookmarks
                </Typography>
                {bookmarks.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No bookmarks saved
                  </Typography>
                ) : (
                  <List dense>
                    {bookmarks.map((bookmark) => (
                      <ListItem 
                        key={bookmark.id}
                        button
                        onClick={() => {
                          setCurrentImageIndex(bookmark.imageIndex);
                          setShowBookmarks(false);
                        }}
                      >
                        <ListItemIcon>
                          <BookmarkIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Series ${bookmark.series}, Slice ${bookmark.imageIndex}`}
                          secondary={bookmark.note}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            ) : (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Available Series
                </Typography>
                <List dense sx={{ mb: 2 }}>
                  {series.map((s) => (
                    <ListItem 
                      key={s.seriesNumber}
                      button
                      selected={selectedSeries?.seriesNumber === s.seriesNumber}
                      onClick={() => handleSeriesSelect(s)}
                    >
                      <ListItemIcon>
                        <Avatar 
                          variant="square"
                          src={`https://via.placeholder.com/80?text=${s.modality}+${s.seriesNumber}`}
                          sx={{ width: 40, height: 40 }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${s.modality}: ${s.seriesDescription}`}
                        secondary={`${s.instances} images`}
                      />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle2" gutterBottom>
                  Current Series Thumbnails
                </Typography>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                    <Grid container spacing={1}>
                      {Array.from({ length: 20 }).map((_, index) => (
                        <Grid item xs={6} key={index}>
                          <Box
                            sx={{
                              border: currentImageIndex === index ? '2px solid #1976d2' : '1px solid #e0e0e0',
                              borderRadius: 1,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              '&:hover': {
                                borderColor: '#90caf9'
                              }
                            }}
                            onClick={() => setCurrentImageIndex(index)}
                          >
                            <img 
                              src={`https://via.placeholder.com/100?text=Slice+${index}`}
                              alt={`Thumbnail ${index}`}
                              style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Grid>

        {/* Main viewer area */}
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            {/* Viewer toolbar */}
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
              flexWrap: 'wrap',
              gap: 1
            }}>
              <Typography variant="subtitle1">
                {selectedSeries?.seriesDescription || 'Loading...'} (Slice {currentImageIndex + 1}/{imageIds.length})
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Pan Tool">
                  <IconButton 
                    size="small" 
                    color={activeTool === 'pan' ? 'primary' : 'default'}
                    onClick={() => handleToolChange('pan')}
                  >
                    <PanIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Zoom In">
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewportAction('zoomIn')}
                  >
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Zoom Out">
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewportAction('zoomOut')}
                  >
                    <ZoomOutIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Rotate Left">
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewportAction('rotateLeft')}
                  >
                    <RotateLeftIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Rotate Right">
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewportAction('rotateRight')}
                  >
                    <RotateRightIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Flip Horizontal">
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewportAction('hflip')}
                  >
                    <FlipIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Invert Colors">
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewportAction('invert')}
                  >
                    <AdjustIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset View">
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewportAction('reset')}
                  >
                    <HistoryIcon />
                  </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Tooltip title="Measurement Tool">
                  <IconButton 
                    size="small" 
                    color={activeTool === 'measure' ? 'primary' : 'default'}
                    onClick={() => {
                      handleToolChange('measure');
                      handleAddMeasurement();
                    }}
                  >
                    <MeasureIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add Bookmark">
                  <IconButton 
                    size="small" 
                    onClick={handleAddBookmark}
                  >
                    <BookmarkIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add Annotation">
                  <IconButton 
                    size="small" 
                    onClick={() => setOpenAnnotationDialog(true)}
                  >
                    <NoteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Window Level Adjustments */}
            <Box sx={{ mb: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" display="block">
                    Window Center: {viewportSettings.wl.center}
                  </Typography>
                  <Slider
                    value={viewportSettings.wl.center}
                    onChange={(e, value) => handleWindowLevelChange('center', value)}
                    min={-1000}
                    max={1000}
                    step={1}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" display="block">
                    Window Width: {viewportSettings.wl.width}
                  </Typography>
                  <Slider
                    value={viewportSettings.wl.width}
                    onChange={(e, value) => handleWindowLevelChange('width', value)}
                    min={1}
                    max={2000}
                    step={1}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* DICOM Viewport */}
            <Box sx={{
              flexGrow: 1,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              backgroundColor: '#000',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {isLoading ? (
                <CircularProgress color="inherit" />
              ) : (
                <>
                  {/* In a real app, this would be the CornerstoneViewport */}
                  <img 
                    src={`https://via.placeholder.com/512x512?text=DICOM+Slice+${currentImageIndex + 1}`}
                    alt={`DICOM Slice ${currentImageIndex + 1}`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      transform: `
                        scale(${viewportSettings.zoom})
                        rotate(${viewportSettings.rotation}deg)
                        scaleX(${viewportSettings.hflip ? -1 : 1})
                        scaleY(${viewportSettings.vflip ? -1 : 1})
                      `,
                      filter: viewportSettings.invert ? 'invert(100%)' : 'none'
                    }}
                    ref={viewportRef}
                  />
                  
                  {/* Navigation controls */}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)'
                      }
                    }}
                    onClick={() => handleImageNavigation('prev')}
                    disabled={currentImageIndex === 0}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)'
                      }
                    }}
                    onClick={() => handleImageNavigation('next')}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Annotation Dialog */}
      <Dialog 
        open={openAnnotationDialog} 
        onClose={() => setOpenAnnotationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Annotation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Annotation Text"
            fullWidth
            multiline
            rows={4}
            value={annotationText}
            onChange={(e) => setAnnotationText(e.target.value)}
          />
          <Typography variant="caption" color="text.secondary">
            Current slice: {currentImageIndex + 1}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAnnotationDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAnnotationSubmit} 
            color="primary"
            variant="contained"
            disabled={!annotationText.trim()}
          >
            Add Annotation
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DICOMViewer;