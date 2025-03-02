import { useState, useRef, useEffect } from 'react'
import QRCode from 'react-qr-code'
import { 
  Typography, 
  Button, 
  Box, 
  Paper, 
  Card, 
  CardContent, 
  Grid, 
  Divider, 
  CircularProgress,
  Snackbar,
  Alert,
  Link as MuiLink,
  Tooltip,
  Container,
  Dialog,
  DialogContent,
  DialogActions
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import IconButton from '@mui/material/IconButton'
import QrCodeIcon from '@mui/icons-material/QrCode'
import PrintIcon from '@mui/icons-material/Print'
import FavoriteIcon from '@mui/icons-material/Favorite'
import WavesIcon from '@mui/icons-material/Waves'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { generateQrCode, getQrIdFromCode } from '../services/qrCodeService'
import { useAuth } from '../contexts/AuthContext'
import html2canvas from 'html2canvas'

// Printable card component
interface PrintableCardProps {
  qrCode: string;
  qrValue: string;
}

const PrintableCard: React.FC<PrintableCardProps> = ({ qrCode, qrValue }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        width: '85.60mm', // Standard credit card width
        mx: 'auto',
        bgcolor: 'white',
        p: 0,
        '@media print': {
          border: 'none',
        }
      }}
    >
      {/* Front of card */}
      <Box 
        sx={{ 
          width: '85.60mm',
          height: '53.98mm', // Standard credit card height
          border: '1px dashed #ccc',
          borderRadius: '4px',
          p: 2, 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
          mb: 4, // Space between front and back when viewing
          pageBreakInside: 'avoid',
          position: 'relative',
          '@media print': {
            mb: 0, // No margin when printing
            pageBreakAfter: 'always',
            border: '1px dashed #ccc',
          }
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            mb: 1,
            color: '#3F72AF',
            fontSize: '14px'
          }}
        >
          Someone thinks you've shown kindness and wants to thank you!
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '12px',
            mt: 1,
            mb: 2
          }}
        >
          So, Thank You! Your kindness makes a difference.
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '11px',
            fontStyle: 'italic',
            mt: 'auto'
          }}
        >
          Keep this card if you wish or pass it along to another kind person!
        </Typography>
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: 5,
            right: 5,
            display: 'flex',
            alignItems: 'center',
            fontSize: '10px',
            color: '#FF7E67'
          }}
        >
          <FavoriteIcon fontSize="inherit" />
          <Typography variant="caption" fontSize="10px" ml={0.5}>
            ripl.io
          </Typography>
        </Box>
      </Box>

      {/* Back of card - will be printed on the back when folded */}
      <Box 
        sx={{ 
          width: '85.60mm',
          height: '53.98mm', // Standard credit card height
          border: '1px dashed #ccc',
          borderRadius: '4px',
          p: 2, 
          display: 'flex',
          flexDirection: 'row', // Side-by-side layout
          alignItems: 'center',
          justifyContent: 'space-between',
          pageBreakInside: 'avoid',
          '@media print': {
            pageBreakBefore: 'always',
            border: '1px dashed #ccc',
          }
        }}
      >
        {/* Left side - QR Code */}
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '40%',
          }}
        >
          <QRCode value={qrValue} size={80} />
        </Box>
        
        {/* Right side - Text */}
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            width: '60%',
            pl: 1
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 'bold',
              mb: 1,
              letterSpacing: '1px',
              fontSize: '10px'
            }}
          >
            ripl.io/{qrCode}
          </Typography>
          
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '9px', 
              textAlign: 'left',
              lineHeight: 1.3
            }}
          >
            Scan the QR code to see how far this ripple of kindness has spread around the globe!
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              mt: 1
            }}
          >
            <FavoriteIcon 
              sx={{ 
                fontSize: '8px',
                color: '#FF7E67',
                mr: 0.5
              }} 
            />
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '8px',
                fontStyle: 'italic'
              }}
            >
              Pass it on!
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

const QrGenerator: React.FC = () => {
  // Get query params to check if we're in edit/print mode
  const searchParams = new URLSearchParams(window.location.search);
  const editCode = searchParams.get('edit');
  
  // Get auth context at component level
  const { currentUser } = useAuth();
  
  // We'll store the QR data in a single state object
  const [qrData, setQrData] = useState<{ id: string; code: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [printDialogOpen, setPrintDialogOpen] = useState(false)
  const [cardImageFront, setCardImageFront] = useState<string | null>(null)
  const [cardImageBack, setCardImageBack] = useState<string | null>(null)
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  
  // Refs for rendering cards to images
  const frontCardRef = useRef<HTMLDivElement | null>(null)
  const backCardRef = useRef<HTMLDivElement | null>(null)
  
  // Effect to load QR code if in edit mode
  useEffect(() => {
    const loadQrCodeForEdit = async () => {
      if (editCode) {
        setIsLoading(true);
        try {
          const qrId = await getQrIdFromCode(editCode);
          if (qrId) {
            setQrData({ id: qrId, code: editCode });
            // Automatically open print dialog
            setTimeout(() => {
              setPrintDialogOpen(true);
            }, 500);
          }
        } catch (error) {
          console.error('Error loading QR code for edit:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadQrCodeForEdit();
  }, [editCode]);

  const handleGenerateQr = async () => {
    setIsLoading(true)
    try {
      const userId = currentUser?.uid;
      const result = await generateQrCode(userId)
      setQrData(result)
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Error generating QR code. Please check console for details.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // The QR code will point to the Firebase hosted app with the short code as a parameter
  const qrValue = qrData ? `https://orleans-39b46.web.app/r/${qrData.code}` : ''
  
  const handleCopyUrl = () => {
    try {
      navigator.clipboard.writeText(qrValue)
      setSnackbarOpen(true)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }
  
  const handleCopyCode = () => {
    if (!qrData) return
    
    try {
      navigator.clipboard.writeText(qrData.code)
      setSnackbarOpen(true)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }
  
  // When dialog opens, we'll generate the card images
  const handleOpenPrintDialog = () => {
    setPrintDialogOpen(true);
    setCardImageFront(null);
    setCardImageBack(null);
    setIsGeneratingImages(true);
  };

  const handleClosePrintDialog = () => {
    setPrintDialogOpen(false);
  };
  
  // Generate card images when dialog is opened
  useEffect(() => {
    const generateCardImages = async () => {
      if (printDialogOpen && frontCardRef.current && backCardRef.current) {
        try {
          setIsGeneratingImages(true);
          
          // Generate front image
          const frontCanvas = await html2canvas(frontCardRef.current, {
            scale: 2, // Higher resolution
            backgroundColor: 'white',
            logging: false,
          });
          const frontImage = frontCanvas.toDataURL('image/png');
          setCardImageFront(frontImage);
          
          // Generate back image
          const backCanvas = await html2canvas(backCardRef.current, {
            scale: 2, // Higher resolution
            backgroundColor: 'white',
            logging: false,
          });
          const backImage = backCanvas.toDataURL('image/png');
          setCardImageBack(backImage);
          
        } catch (error) {
          console.error('Error generating card images:', error);
        } finally {
          setIsGeneratingImages(false);
        }
      }
    };
    
    if (printDialogOpen) {
      // Allow time for the dialog to render before capturing
      const timer = setTimeout(() => {
        generateCardImages();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [printDialogOpen]);
  
  // Manual print function (not using react-to-print)
  const handlePrint = () => {
    if (!cardImageFront || !cardImageBack) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups to print the card');
      return;
    }
    
    // Write HTML content to the new window - stacked for easy folding
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ripl.io Kindness Card</title>
          <style>
            @page {
              size: auto;
              margin: 10mm;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
              font-family: Arial, sans-serif;
            }
            .print-page {
              max-width: 95mm;
              margin: 0 auto;
              padding: 5mm;
              page-break-inside: avoid;
            }
            .card-container {
              width: 85.60mm;
              border: none;
              margin: 0 auto;
            }
            .card-stack {
              border: 2px dashed #aaa;
              padding: 3mm;
              border-radius: 2px;
              background-color: #f5f5f5;
              margin-bottom: 5mm;
            }
            .fold-instruction {
              text-align: center;
              font-size: 10px;
              color: #666;
              font-style: italic;
              padding: 3px 0;
              border-top: 1px dashed #ccc;
              border-bottom: 1px dashed #ccc;
              margin: 2mm 0;
              background-color: #eee;
            }
            .card-label {
              font-size: 10px;
              color: #666;
              margin-bottom: 2px;
              display: block;
            }
            img {
              width: 100%;
              height: auto;
              display: block;
              border: 1px dashed #ccc;
            }
            .instructions {
              width: 100%;
              margin-top: 5mm;
              padding: 10px;
              border: 1px dashed #ccc;
              border-radius: 4px;
              background-color: #f9f9f9;
            }
            h3 {
              font-size: 14px;
              margin-top: 0;
              margin-bottom: 8px;
            }
            ol {
              padding-left: 20px;
              margin: 8px 0;
            }
            li {
              font-size: 12px;
              margin-bottom: 4px;
            }
            .title {
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              color: #3F72AF;
              margin-bottom: 5mm;
            }
          </style>
        </head>
        <body>
          <div class="print-page">
            <div class="title">Ripl.io Kindness Card</div>
            
            <div class="card-stack">
              <div class="card-container">
                <img src="${cardImageFront}" alt="Card Front" />
              </div>
              
              <div class="fold-instruction">
                ✂️ Cut along the outer dotted line and fold here ✂️
              </div>
              
              <div class="card-container">
                <img src="${cardImageBack}" alt="Card Back" />
              </div>
            </div>
            
            <div class="instructions">
              <h3>How to use your Kindness Card:</h3>
              <ol>
                <li>Cut along the outer dotted line around both sides</li>
                <li>Fold along the center line to create a two-sided card</li>
                <li>Give to someone to thank them for their kindness</li>
                <li>Ask them to scan the QR code to see its impact</li>
                <li>Encourage them to pass it along to someone else</li>
              </ol>
            </div>
          </div>
        </body>
      </html>
    `);
    
    // Print the window
    printWindow.document.close();
    printWindow.focus();
    
    // Use a timeout to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      // Close after printing
      printWindow.close();
      handleClosePrintDialog();
    }, 500);
  };

  return (
    <Container 
      sx={{ 
        maxWidth: { xs: '100%', md: 'md' },
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          textAlign: 'center',
          backgroundColor: 'transparent',
          width: '100%'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Ripl.io: Create Your Link
        </Typography>
        
        <Typography variant="body1" paragraph>
          Generate a unique link to spread kindness and track its impact around the world
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mb: 3,
          opacity: 0.7,
          fontSize: '0.875rem'
        }}>
          <InfoOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="caption">
            For testing, scanning in different browsers or incognito mode will count as different users
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={handleGenerateQr} 
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <QrCodeIcon />}
          sx={{ 
            mb: 4,
            width: { xs: '100%', sm: 'auto' },
            px: { xs: 2, sm: 4 }
          }}
        >
          {isLoading ? 'Generating...' : 'Generate Link'}
        </Button>
        
        {qrData && (
          <>
            <Card 
              variant="outlined" 
              sx={{ 
                mt: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Grid container>
                <Grid item xs={12} md={5} sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  bgcolor: '#fff',
                  p: { xs: 2, sm: 3 }
                }}>
                  <Box sx={{ 
                    p: { xs: 1, sm: 2 }, 
                    bgcolor: 'white', 
                    borderRadius: 1,
                    boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                    width: { xs: '80%', sm: 'auto' }
                  }}>
                    <QRCode 
                      value={qrValue} 
                      size={200}
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        maxWidth: '200px' 
                      }} 
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={7}>
                  <CardContent sx={{ 
                    p: { xs: 2, sm: 3, md: 4 }, 
                    height: '100%',
                    width: '100%'
                  }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Your Ripl.io link is ready!
                    </Typography>
                    
                    <Box sx={{ mb: 2, mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Your unique code:
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        mt: 1
                      }}>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 'bold', 
                            letterSpacing: '1px', 
                            color: 'primary.main',
                            backgroundColor: 'rgba(63, 114, 175, 0.08)',
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1
                          }}
                        >
                          {qrData.code}
                        </Typography>
                        <Tooltip title="Copy code">
                          <IconButton 
                            size="small" 
                            onClick={handleCopyCode}
                            sx={{ 
                              color: 'primary.main', 
                              bgcolor: 'rgba(63, 114, 175, 0.08)',
                              '&:hover': { 
                                bgcolor: 'rgba(63, 114, 175, 0.15)' 
                              } 
                            }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" paragraph sx={{ mb: 2 }}>
                      Ripl.io tracks how your kindness spreads globally. When someone scans this QR code, 
                      they'll see its impact and can continue the chain of kindness.
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ 
                      mt: 2,
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 0 },
                      width: '100%' 
                    }}>
                      <MuiLink 
                        href={qrValue} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        underline="none"
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                      >
                        <Button 
                          variant="outlined" 
                          size="small" 
                          sx={{ 
                            mr: { xs: 0, sm: 1 }, 
                            width: { xs: '100%', sm: 'auto' }
                          }}
                        >
                          View Stats Page
                        </Button>
                      </MuiLink>
                      
                      <Tooltip title="Copy URL to clipboard">
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={handleCopyUrl}
                          startIcon={<ContentCopyIcon />}
                          sx={{ 
                            mr: { xs: 0, sm: 1 }, 
                            width: { xs: '100%', sm: 'auto' }
                          }}
                        >
                          Copy URL
                        </Button>
                      </Tooltip>

                      <Tooltip title="Print kindness card">
                        <Button 
                          variant="outlined"
                          color="secondary" 
                          size="small"
                          onClick={handleOpenPrintDialog}
                          startIcon={<PrintIcon />}
                          sx={{ 
                            ml: { xs: 0, sm: 1 },
                            width: { xs: '100%', sm: 'auto' }
                          }}
                        >
                          Print Card
                        </Button>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Grid>
              </Grid>
            </Card>

            {/* Printable Card Section */}
            <Paper 
              elevation={1}
              sx={{ 
                mt: 4, 
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                border: '1px solid rgba(63, 114, 175, 0.2)',
                bgcolor: '#FAFAFA',
                width: '100%'
              }}
            >
              <Typography variant="h6" component="h3" gutterBottom color="primary">
                Shareable Kindness Card
              </Typography>
              
              <Typography variant="body2" paragraph>
                Print a physical card to share your appreciation in person. 
                Simply cut along the dotted line and fold to create a credit card-sized token of gratitude.
              </Typography>
              
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PrintIcon />}
                onClick={handleOpenPrintDialog}
                sx={{ 
                  mb: 3,
                  bgcolor: '#4CAF50',
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    bgcolor: '#3d8c40',
                  }
                }}
              >
                Print Kindness Card
              </Button>
              
              <Box sx={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: 1,
                p: 2,
                bgcolor: 'white',
                mb: 2
              }}>
                <Typography variant="caption" paragraph color="text.secondary" sx={{ mb: 2 }}>
                  Card Preview (front and back):
                </Typography>
                <Box sx={{ 
                  opacity: 0.8,
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%', 
                  height: 'auto'
                }}>
                  <PrintableCard qrCode={qrData.code} qrValue={qrValue} />
                </Box>
                <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                  Note: The printed card will be full-sized and higher quality than this preview.
                </Typography>
              </Box>
            </Paper>
          </>
        )}
      </Paper>
      
      {/* Hidden elements for generating card images */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {/* Front card reference */}
        <Box ref={frontCardRef} sx={{ width: '85.60mm', height: '53.98mm', backgroundColor: 'white' }}>
          <Box 
            sx={{ 
              width: '85.60mm',
              height: '53.98mm',
              border: '1px dashed #ccc',
              borderRadius: '4px',
              p: 2, 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center',
              position: 'relative',
              backgroundColor: 'white',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                mb: 1,
                color: '#3F72AF',
                fontSize: '14px'
              }}
            >
              Someone thinks you've shown kindness and wants to thank you!
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: '12px',
                mt: 1,
                mb: 2
              }}
            >
              So, Thank You! Your kindness makes a difference.
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: '11px',
                fontStyle: 'italic',
                mt: 'auto'
              }}
            >
              Keep this card if you wish or pass it along to another kind person!
            </Typography>
            <Box 
              sx={{ 
                position: 'absolute',
                bottom: 5,
                right: 5,
                display: 'flex',
                alignItems: 'center',
                fontSize: '10px',
                color: '#FF7E67'
              }}
            >
              <Box position="relative" display="inline-flex">
                <WavesIcon fontSize="inherit" sx={{ color: '#3F72AF' }} />
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  sx={{ transform: 'translate(-50%, -50%)' }}
                >
                  <FavoriteIcon sx={{ color: '#FF7E67', fontSize: '8px' }} />
                </Box>
              </Box>
              <Typography variant="caption" fontSize="10px" ml={0.5}>
                orleans-39b46.web.app
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Back card reference */}
        <Box ref={backCardRef} sx={{ width: '85.60mm', height: '53.98mm', backgroundColor: 'white' }}>
          <Box 
            sx={{ 
              width: '85.60mm',
              height: '53.98mm',
              border: '1px dashed #ccc',
              borderRadius: '4px',
              p: 2, 
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'white',
            }}
          >
            {/* Left side - QR Code */}
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '40%',
              }}
            >
              <QRCode value={qrValue} size={80} />
            </Box>
            
            {/* Right side - Text */}
            <Box 
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: '60%',
                pl: 1
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 1,
                  letterSpacing: '1px',
                  fontSize: '10px'
                }}
              >
                orleans-39b46.web.app/r/{qrData?.code || ''}
              </Typography>
              
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '9px', 
                  textAlign: 'left',
                  lineHeight: 1.3
                }}
              >
                Scan the QR code to see how far this ripple of kindness has spread around the globe!
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mt: 1
                }}
              >
                <FavoriteIcon 
                  sx={{ 
                    fontSize: '8px',
                    color: '#FF7E67',
                    mr: 0.5
                  }} 
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: '8px',
                    fontStyle: 'italic'
                  }}
                >
                  Pass it on!
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </div>
      
      {/* Printing Dialog */}
      <Dialog
        open={printDialogOpen}
        onClose={handleClosePrintDialog}
        maxWidth="sm"
      >
        <DialogContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Print Your Kindness Card
          </Typography>
          
          <Typography variant="body2" paragraph>
            When printed, this card should be cut along the dotted lines and folded to create 
            a credit card-sized token of gratitude that can be shared with others.
          </Typography>
          
          {isGeneratingImages ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <>
              {/* Image Preview Box */}
              <Box sx={{ 
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 3,
                backgroundColor: '#f9f9f9',
                mb: 3,
                maxWidth: '85.60mm',
                mx: 'auto'
              }}>
                <Typography variant="caption" paragraph color="text.secondary">
                  Card Preview (front and back):
                </Typography>
                
                {cardImageFront && cardImageBack ? (
                  /* Print Content Preview */
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ mb: 1, alignSelf: 'flex-start', color: 'text.secondary' }}>
                      Front:
                    </Typography>
                    <img 
                      src={cardImageFront} 
                      alt="Card Front" 
                      style={{ 
                        width: '100%', 
                        maxWidth: '85.60mm',
                        height: 'auto',
                        marginBottom: '16px',
                        border: '1px solid #ddd'
                      }} 
                    />
                    
                    <Typography variant="caption" sx={{ mb: 1, alignSelf: 'flex-start', color: 'text.secondary' }}>
                      Back:
                    </Typography>
                    <img 
                      src={cardImageBack} 
                      alt="Card Back" 
                      style={{ 
                        width: '100%', 
                        maxWidth: '85.60mm',
                        height: 'auto',
                        border: '1px solid #ddd'
                      }} 
                    />
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      Unable to generate preview
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* We don't need hidden content anymore since we're using direct window printing */}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrintDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={isGeneratingImages || !cardImageFront || !cardImageBack}
          >
            Print Card
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={2000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default QrGenerator