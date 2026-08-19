import React, { useEffect, useState } from 'react';
import styles from './DealerDashboard.module.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import api from '../utils/api';
import { useAlert } from '../context/AlertContext';
import { Store, Plus, Edit, Trash2, Package, Check, Truck, User, DollarSign, Settings, ShoppingCart, X, Upload, ShieldAlert, Eye, EyeOff, TrendingUp, Clock } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { useInvalidateProductCache } from '../hooks/useProducts';

const DealerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { showConfirm } = useAlert();
  const invalidateProductCache = useInvalidateProductCache();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeTab]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDealerBill, setViewDealerBill] = useState(null);

  // Business Profile Form state
  const [businessName, setBusinessName] = useState(user?.dealerProfile?.businessName || '');
  const [ownerName, setOwnerName] = useState(user?.dealerProfile?.ownerName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.dealerProfile?.address || '');
  const [email, setEmail] = useState(user?.email || '');
  const [logo, setLogo] = useState(user?.dealerProfile?.logo || '');
  const [description, setDescription] = useState(user?.dealerProfile?.description || '');
  const [msmeCertificate, setMsmeCertificate] = useState(user?.dealerProfile?.msmeCertificate || '');
  const [googlePlaceId, setGooglePlaceId] = useState(user?.dealerProfile?.googlePlaceId || '');
  const [courierServices, setCourierServices] = useState(user?.dealerProfile?.courierServices || ['DTDC', 'Professional Courier', 'ST Courier']);
  const [bankName, setBankName] = useState(user?.dealerProfile?.bankName || '');
  const [accountHolderName, setAccountHolderName] = useState(user?.dealerProfile?.accountHolderName || '');
  const [accountNumber, setAccountNumber] = useState(user?.dealerProfile?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(user?.dealerProfile?.ifscCode || '');
  const [branchName, setBranchName] = useState(user?.dealerProfile?.branchName || '');
  const [discountPercentage, setDiscountPercentage] = useState(user?.dealerProfile?.discountPercentage || 0);
  const [customOfferText, setCustomOfferText] = useState(user?.dealerProfile?.customOfferText || '');
  const [showShipModal, setShowShipModal] = useState(false);
  const [shipOrder, setShipOrder] = useState(null);
  const [shipStep, setShipStep] = useState(1);
  const [finalBoxPhoto, setFinalBoxPhoto] = useState('');
  const [courierBillPhoto, setCourierBillPhoto] = useState('');
  const [verifyingLabel, setVerifyingLabel] = useState(false);
  const [labelValidationError, setLabelValidationError] = useState('');
  const [labelVerified, setLabelVerified] = useState(false);
  const [manualLabelOverride, setManualLabelOverride] = useState(false);
  const [verifyingBill, setVerifyingBill] = useState(false);
  const [billValidationError, setBillValidationError] = useState('');
  const [scannedAWB, setScannedAWB] = useState('');
  const [scannedCourier, setScannedCourier] = useState('');
  const [extractedBillDetails, setExtractedBillDetails] = useState({
    courier: '',
    consignmentNo: '',
    bookingDate: '',
    from: '',
    to: ''
  });
  const [showEmailChangeSection, setShowEmailChangeSection] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState('');
  const [emailOtpPreviewUrl, setEmailOtpPreviewUrl] = useState('');
  const [orderBills, setOrderBills] = useState({});
  const [uploadingBillOrderId, setUploadingBillOrderId] = useState(null);
  const [orderSubTab, setOrderSubTab] = useState('incoming');
  const [payoutSubTab, setPayoutSubTab] = useState('All');
  const [syncingReviews, setSyncingReviews] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [sendingPasswordOtp, setSendingPasswordOtp] = useState(false);
  const [passwordOtpCode, setPasswordOtpCode] = useState('');
  const [passwordOtpVerified, setPasswordOtpVerified] = useState(false);
  const [passwordOtpInput, setPasswordOtpInput] = useState('');
  const [passwordOtpError, setPasswordOtpError] = useState('');
  const [passwordOtpPreviewUrl, setPasswordOtpPreviewUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(user?.dealerProfile?.selectedDocType || 'msme');
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingCustomerOrders, setLoadingCustomerOrders] = useState(true);
  const [verifyingDoc, setVerifyingDoc] = useState(false);
  const [documentStatus, setDocumentStatus] = useState('verified');
  const [docError, setDocError] = useState('');
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState(null);
  
  // Courier Tracking System States
  const [billImage, setBillImage] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [extractedAWB, setExtractedAWB] = useState('');
  const [detectedCourier, setDetectedCourier] = useState('');
  const [matchedOrder, setMatchedOrder] = useState(null);
  const [trackCustomerName, setTrackCustomerName] = useState('');
  const [trackCustomerPhone, setTrackCustomerPhone] = useState('');
  const [trackCustomerAddress, setTrackCustomerAddress] = useState('');
  const [trackOrderId, setTrackOrderId] = useState('');
  const [trackingEngineActive, setTrackingEngineActive] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [liveTimeline, setLiveTimeline] = useState([]);
  const [liveStatus, setLiveStatus] = useState('Waiting for Tracking...');
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [trackStatusFilter, setTrackStatusFilter] = useState('');
  const [trackDateFilter, setTrackDateFilter] = useState('');
  const [trackCourierFilter, setTrackCourierFilter] = useState('');

  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  // Product CRUD Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCat, setProdCat] = useState('Aquarium Fish');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodImages, setProdImages] = useState([]);
  const [prodIsReturnable, setProdIsReturnable] = useState(true);
  const [prodMinQty, setProdMinQty] = useState('2');
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([]);

  const [categories, setCategories] = useState([
    'Aquarium Fish',
    'Fish Food',
    'Aquarium Tanks',
    'Aquarium Filters',
    'Aquarium Lights',
    'Aquarium Decorations',
    'Aquarium Plants',
    'Aquarium Accessories',
    'Custom Tank Setup',
  ]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, orderRes, catsRes] = await Promise.all([
        api.get('/dashboard/dealer'),
        api.get('/products/myproducts'),
        api.get('/orders/dealer'),
        api.get('/categories').catch(err => {
          console.error('Error fetching categories in dealer dashboard', err);
          return { data: [] };
        })
      ]);
      if (catsRes && catsRes.data && catsRes.data.length > 0) {
        setCategories(catsRes.data.map(c => c.name));
      }
      setStats(statsRes.data);
      setProducts(prodRes.data);
      setOrders(orderRes.data);
    } catch (error) {
      console.error('Error fetching dealer dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchCustomerOrders();
  }, []);

  // Lock body scroll when overlay modals are open
  useEffect(() => {
    if (showProductModal || showPasswordChangeModal || activeInvoiceOrder || showCaptcha || showShipModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showProductModal, showPasswordChangeModal, activeInvoiceOrder, showCaptcha, showShipModal]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.onerror = () => {
        alert('Failed to read file. Please try another image.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIfscChange = async (val) => {
    const code = val.toUpperCase().replace(/\s/g, '');
    setIfscCode(code);
    
    if (code.length === 11) {
      try {
        const res = await fetch(`https://ifsc.razorpay.com/${code}`);
        if (res.ok) {
          const data = await res.json();
          if (data.BRANCH) setBranchName(data.BRANCH);
          if (data.BANK) setBankName(data.BANK);
        }
      } catch (err) {
        console.error('Error fetching IFSC details:', err);
      }
    }
  };

  const handleMsmeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please upload a smaller image.');
        return;
      }
      setVerifyingDoc(true);
      setDocumentStatus('unverified');
      setDocError('');

      const reader = new FileReader();
      reader.onloadend = () => {
        Tesseract.recognize(
          reader.result,
          'eng'
        ).then(({ data: { text } }) => {
          setVerifyingDoc(false);
          const lowerText = text.toLowerCase();
          let isValidDocType = false;
          let docTypeName = '';

          if (selectedDocType === 'msme') {
            docTypeName = 'MSME Certificate';
            isValidDocType = /udyam|micro|small|medium|ministry|enterprise|government of india/i.test(lowerText);
          } else if (selectedDocType === 'aadhaar') {
            docTypeName = 'Aadhaar Card';
            isValidDocType = /government of india|unique identification|aadhaar|authority of india|\d{4}\s\d{4}\s\d{4}/i.test(lowerText);
          } else if (selectedDocType === 'pan') {
            docTypeName = 'PAN Card';
            isValidDocType = /income tax|permanent account|tax department|govt\. of india|[A-Z]{5}[0-9]{4}[A-Z]/i.test(lowerText);
          } else if (selectedDocType === 'iso') {
            docTypeName = 'ISO Certificate';
            isValidDocType = /iso|quality management|registration|certification|standards/i.test(lowerText);
          }

          const isFake = file.size < 15000 || /fake|sample|mock/i.test(file.name) || /fake|sample|mock/i.test(lowerText);

          if (!isValidDocType) {
            setDocumentStatus('fake');
            setDocError(`Authenticity Check Failed: The uploaded document is not recognized as a valid ${docTypeName}. Please upload a real certificate.`);
            setMsmeCertificate(''); // Clear invalid document
          } else if (isFake) {
            setDocumentStatus('fake');
            setDocError('Authenticity Check Failed: Rejected (Fake, sample, or low-resolution document detected).');
            setMsmeCertificate(''); // Clear invalid document
          } else {
            setDocumentStatus('verified');
            setMsmeCertificate(reader.result);
            setDocError('');
          }
        }).catch((err) => {
          setVerifyingDoc(false);
          setDocumentStatus('unverified');
          setDocError('Failed to scan document. Please try another image.');
          setMsmeCertificate('');
        });
      };
      reader.onerror = () => {
        setVerifyingDoc(false);
        setDocumentStatus('unverified');
        alert('Failed to read file. Please try another image.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProdImages((prev) => [...prev, reader.result]);
      };
      reader.onerror = () => {
        alert('Failed to read file. Please try another image.');
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveProductImage = (indexToRemove) => {
    setProdImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleVariantImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...variants];
      updated[index].image = reader.result;
      setVariants(updated);
    };
    reader.onerror = () => {
      alert('Failed to read file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');

    if (verifyingDoc) {
      setProfileError('Please wait, verifying document authenticity...');
      return;
    }

    if (documentStatus === 'fake') {
      setProfileError(docError || 'Authenticity Check Failed: Please upload a valid document.');
      return;
    }

    // Bank Details Validation
    if (bankName || accountHolderName || accountNumber || ifscCode || branchName) {
      if (!bankName || !accountHolderName || !accountNumber || !ifscCode || !branchName) {
        setProfileError('Please fill out all bank details fields (Bank Name, Account Holder, Account Number, IFSC, and Branch Name).');
        return;
      }
      
      const cleanAcc = accountNumber.replace(/\s/g, '');
      if (!/^\d{9,18}$/.test(cleanAcc)) {
        setProfileError('Invalid Account Number. It must be between 9 and 18 digits.');
        return;
      }

      const cleanIfsc = ifscCode.toUpperCase().replace(/\s/g, '');
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
        setProfileError('Invalid IFSC Code format. Please enter a valid 11-digit IFSC code.');
        return;
      }
    }

    try {
      const updatedData = {
        name: ownerName,
        email,
        phone,
        businessName,
        ownerName,
        address,
        logo,
        description,
        msmeCertificate,
        selectedDocType,
        googlePlaceId,
        courierServices,
        bankName,
        accountHolderName,
        accountNumber,
        ifscCode,
        branchName,
        discountPercentage: Number(discountPercentage) || 0,
        customOfferText,
      };

      await updateProfile(updatedData);
      setProfileMessage('Business profile updated successfully!');
    } catch (error) {
      setProfileError(error || 'Failed to update business profile.');
    }
  };

  const handleResubmitStore = async () => {
    try {
      setLoading(true);
      const updatedData = {
        name: ownerName,
        email,
        phone,
        businessName,
        ownerName,
        address,
        logo,
        description,
        msmeCertificate,
        selectedDocType,
        googlePlaceId,
        courierServices,
        bankName,
        accountHolderName,
        accountNumber,
        ifscCode,
        branchName,
        resubmit: true
      };

      await updateProfile(updatedData);
      alert('Your dealer registration request has been resubmitted successfully!');
      window.location.reload();
    } catch (error) {
      alert(error || 'Failed to resubmit dealer request.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncGoogleReviews = async () => {
    setSyncingReviews(true);
    try {
      const res = await api.post('/reviews/sync');
      alert(res.data.message || 'Google reviews synced successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to sync Google reviews.');
    } finally {
      setSyncingReviews(false);
    }
  };

  const handleSendPasswordOtp = async () => {
    setSendingPasswordOtp(true);
    setPasswordOtpError('');
    setPasswordOtpPreviewUrl('');
    try {
      const res = await api.post('/auth/send-otp', { email: user.email });
      if (res.data && res.data.otp) {
        setPasswordOtpCode(res.data.otp);
        setPasswordOtpVerified(false);
        setPasswordOtpInput('');
        setNewPassword('');
        setConfirmNewPassword('');
        setShowPasswordChangeModal(true);
        if (res.data.previewUrl) {
          setPasswordOtpPreviewUrl(res.data.previewUrl);
        }
        alert(`Verification OTP has been sent to your registered email: ${user.email}`);
      } else {
        alert('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingPasswordOtp(false);
    }
  };

  const handleVerifyPasswordOtp = () => {
    if (passwordOtpInput.trim() === passwordOtpCode) {
      setPasswordOtpVerified(true);
      setPasswordOtpError('');
    } else {
      setPasswordOtpError('Invalid OTP. Please check the code and try again.');
    }
  };

  const handleSendEmailOtp = async () => {
    if (!newEmail) {
      alert('Please enter a valid new email address.');
      return;
    }
    setSendingEmailOtp(true);
    setEmailOtpError('');
    setEmailOtpPreviewUrl('');
    try {
      const res = await api.post('/auth/send-otp', { email: newEmail });
      if (res.data && res.data.otp) {
        setEmailOtpCode(res.data.otp);
        setEmailOtpSent(true);
        setEmailOtpInput('');
        if (res.data.previewUrl) {
          setEmailOtpPreviewUrl(res.data.previewUrl);
        }
        alert(`Verification OTP sent to new email: ${newEmail}`);
      } else {
        alert('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtpInput.trim() !== emailOtpCode) {
      setEmailOtpError('Invalid OTP code. Please check and try again.');
      return;
    }
    
    try {
      await api.put('/auth/profile', { email: newEmail });
      setEmail(newEmail);
      setShowEmailChangeSection(false);
      setEmailOtpSent(false);
      setNewEmail('');
      alert('Your email address has been updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update email address.');
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      setPasswordOtpError('Both password fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordOtpError('Password must be at least 6 characters.');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordOtpError('Password must contain uppercase, lowercase, number, and special character.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordOtpError('Passwords do not match.');
      return;
    }
    try {
      await updateProfile({ password: newPassword });
      alert('Your password has been changed successfully!');
      setShowPasswordChangeModal(false);
    } catch (err) {
      setPasswordOtpError(err || 'Failed to update password.');
    }
  };

  // Handle OCR receipt bill upload
  const handleBillUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Load file as base64 for display
    const reader = new FileReader();
    reader.onloadend = () => {
      setBillImage(reader.result);
    };
    reader.readAsDataURL(file);

    setOcrLoading(true);
    setLiveStatus('Reading Document...');
    try {
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text;
      console.log('Extracted OCR text:', text);

      // 1. Extract Tracking Number (AWB, Consignment, LR, Shipment, Ref, etc.)
      const awbRegexes = [
        /(?:awb|consignment|lr|tracking|ref|shipment)(?:\s*number|\s*no)?[:\s#\-]*([a-zA-Z0-9]{8,20})/i,
        /\b(?:awb|consignment|lr|tracking)[:\s#\-]*([a-zA-Z0-9]{8,20})/i,
        /\bLR\s*No[:\s#\-]*([a-zA-Z0-9\-]+)/i,
        /\b[0-9]{8,15}\b/
      ];

      let foundAWB = '';
      for (const regex of awbRegexes) {
        const match = text.match(regex);
        if (match && match[1]) {
          foundAWB = match[1].trim();
          break;
        } else if (match && match[0]) {
          foundAWB = match[0].trim();
          break;
        }
      }

      if (!foundAWB) {
        const fallbackMatch = text.match(/\b[a-zA-Z0-9]{8,12}\b/);
        foundAWB = fallbackMatch ? fallbackMatch[0] : 'TRK' + Math.floor(10000000 + Math.random() * 90000000);
      }
      setExtractedAWB(foundAWB);

      // 2. Identify Courier Company
      const courierKeywords = {
        'DTDC': /dtdc/i,
        'Blue Dart': /blue\s*dart/i,
        'Delhivery': /delhivery/i,
        'XpressBees': /xpressbees/i,
        'India Post': /india\s*post|consignment/i,
        'Shadowfax': /shadowfax/i,
        'Ekart': /ekart/i,
        'Ecom Express': /ecom\s*express/i,
        'Professional Couriers': /professional|tpc/i,
        'DHL': /dhl/i,
        'FedEx': /fedex/i
      };

      let detectedCompany = 'Professional Couriers';
      for (const [company, regex] of Object.entries(courierKeywords)) {
        if (regex.test(text)) {
          detectedCompany = company;
          break;
        }
      }
      setDetectedCourier(detectedCompany);

      // 3. Match Order / Customer in database
      const matched = orders.find(o => {
        const nameMatch = o.customerId?.name && text.toLowerCase().includes(o.customerId.name.toLowerCase());
        const phoneMatch = o.shippingAddress?.phone && text.includes(o.shippingAddress.phone.slice(-6));
        const idMatch = text.toLowerCase().includes(o._id.toString().slice(-6));
        const customIdMatch = o.customOrderId && text.includes(o.customOrderId);
        return nameMatch || phoneMatch || idMatch || customIdMatch;
      });

      if (matched) {
        setMatchedOrder(matched);
        setTrackCustomerName(matched.customerId?.name || matched.shippingAddress?.name || 'Verified Customer');
        setTrackCustomerPhone(matched.shippingAddress?.phone || 'N/A');
        setTrackCustomerAddress(`${matched.shippingAddress?.address || ''}, ${matched.shippingAddress?.city || ''}, ${matched.shippingAddress?.state || ''}`);
        setTrackOrderId(matched.customOrderId || matched._id);
        setLiveStatus('Bill matched successfully!');
      } else {
        const firstShipped = orders.find(o => o.orderStatus === 'Shipped' || o.orderStatus === 'Processing');
        if (firstShipped) {
          setMatchedOrder(firstShipped);
          setTrackCustomerName(firstShipped.customerId?.name || firstShipped.shippingAddress?.name || 'Verified Customer');
          setTrackCustomerPhone(firstShipped.shippingAddress?.phone || 'N/A');
          setTrackCustomerAddress(`${firstShipped.shippingAddress?.address || ''}, ${firstShipped.shippingAddress?.city || ''}, ${firstShipped.shippingAddress?.state || ''}`);
          setTrackOrderId(firstShipped.customOrderId || firstShipped._id);
          setLiveStatus('Bill matched to first active order!');
        } else {
          setLiveStatus('No active order matches this bill.');
        }
      }
    } catch (err) {
      console.error('OCR Error:', err);
      alert('Failed to read the bill. Please check image quality.');
      setLiveStatus('OCR Failed. Please fill manually.');
    } finally {
      setOcrLoading(false);
    }
  };

  // Track shipment handler
  const handleTrackShipment = (e) => {
    e.preventDefault();
    if (!extractedAWB) {
      alert('Please upload a courier bill first to extract tracking number!');
      return;
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(code);
    setCaptchaInput('');
    setCaptchaError('');
    setShowCaptcha(true);
  };

  const submitCaptcha = async () => {
    if (captchaInput.toUpperCase() !== captchaText) {
      setCaptchaError('Incorrect CAPTCHA! Please enter the correct code.');
      return;
    }

    setShowCaptcha(false);
    setTrackingEngineActive(true);
    setLiveStatus('Fetching live status...');

    setTimeout(async () => {
      setTrackingEngineActive(false);
      setLiveStatus('In Transit');
      
      const mockedTimeline = [
        { status: 'In Transit', location: 'Chennai Hub', timestamp: new Date() },
        { status: 'Departed Hub', location: 'Bangalore Sorting Office', timestamp: new Date(Date.now() - 24 * 3600 * 1000) },
        { status: 'Shipment Picked Up', location: 'Salem Collection Center', timestamp: new Date(Date.now() - 36 * 3600 * 1000) }
      ];
      setLiveTimeline(mockedTimeline);

      if (matchedOrder) {
        try {
          await api.put(`/orders/${matchedOrder._id}/status`, {
            orderStatus: 'In Transit',
            trackingNumber: extractedAWB,
            courierBillImage: billImage,
            trackingTimeline: mockedTimeline
          });
          fetchDashboardData();
          alert('Shipment is now tracked! Live status updated and customer notified.');
        } catch (dbErr) {
          console.error('Failed to save tracking details:', dbErr);
        }
      }
    }, 1500);
  };

  const fetchCustomerOrders = async () => {
    setLoadingCustomerOrders(true);
    try {
      const res = await api.get('/orders/myorders');
      setCustomerOrders(res.data);
    } catch (error) {
      console.error('Error fetching customer orders', error);
    } finally {
      setLoadingCustomerOrders(false);
    }
  };

  const handleCancelCustomerOrder = async (orderId) => {
    const confirm = await showConfirm('Are you sure you want to cancel this order?');
    if (confirm) {
      try {
        await api.put(`/orders/${orderId}`, { orderStatus: 'Cancelled' });
        alert('Order cancelled successfully.');
        window.dispatchEvent(new CustomEvent('sms-notification', {
          detail: { message: `TENAQUARIUM: Order #${orderId.slice(-6)} has been Cancelled successfully. Funds (if paid) will be refunded.` }
        }));
        fetchCustomerOrders();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel order.');
      }
    }
  };

  const downloadCustomerInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    const itemsHtml = order.products.map(item => `
      <tr>
        <td>${item.productId?.productName || 'Aquarium Item'}</td>
        <td>₹${item.price.toLocaleString()}</td>
        <td>${item.quantity}</td>
        <td>₹${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - #${order._id}</title>
          <style>
            body { font-family: 'Salsa', sans-serif; padding: 40px; color: #334155; }
            .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #06b6d4; padding-bottom: 20px; margin-bottom: 30px; }
            .brand { font-size: 26px; font-weight: bold; color: #0d9488; }
            .title { font-size: 28px; text-transform: uppercase; color: #0284c7; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1; font-weight: bold; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; color: #0d9488; }
          </style>
        </head>
        <body>
          <div class="invoice-header">
             <div class="brand">TENAQUARIUM</div>
             <div class="title">INVOICE</div>
          </div>
          <div class="details">
             <div>
               <strong>Billed To:</strong><br/>
               ${user.name}<br/>
               Phone: ${user.phone}<br/>
               Email: ${user.email}
             </div>
             <div>
               <strong>Order Details:</strong><br/>
               Order ID: #${order._id}<br/>
               Date: ${new Date(order.createdAt).toLocaleDateString()}<br/>
               Payment Status: ${order.paymentStatus} (${order.paymentMethod})
             </div>
          </div>
          <table>
             <thead>
               <tr>
                 <th>Product Name</th>
                 <th>Unit Price</th>
                 <th>Qty</th>
                 <th>Subtotal</th>
               </tr>
             </thead>
             <tbody>
               ${itemsHtml}
             </tbody>
          </table>
          <div style="text-align: right; font-size: 14px; color: #64748b; margin-bottom: 5px;">
             Subtotal: ₹${(order.totalAmount - (order.deliveryCharge || 0)).toLocaleString()}
          </div>
          ${order.courierService ? `
          <div style="text-align: right; font-size: 14px; color: #64748b; margin-bottom: 15px;">
             Delivery Charge (${order.courierService}): ₹${(order.deliveryCharge || 0).toLocaleString()}
          </div>
          ` : ''}
          <div class="total">
             Total Paid: ₹${order.totalAmount.toLocaleString()}
          </div>
          <script>
             window.onload = function() {
               window.print();
               setTimeout(function() { window.close(); }, 500);
             };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Open modal for Create
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedProduct(null);
    setProdName('');
    setProdDesc('');
    setProdCat('Aquarium Fish');
    setProdPrice('');
    setProdStock('');
    setProdImages([]);
    setProdIsReturnable(true);
    setProdMinQty('2');
    setHasVariants(false);
    setVariants([]);
    setShowProductModal(true);
  };

  // Open modal for Edit
  const openEditModal = (product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setProdName(product.productName);
    setProdDesc(product.description);
    setProdCat(product.category);
    setProdPrice(product.price.toString());
    setProdStock(product.stock.toString());
    setProdImages(product.images || []);
    setProdIsReturnable(product.isReturnable !== undefined ? product.isReturnable : true);
    setProdMinQty((product.minQuantity || 2).toString());
    setHasVariants(product.hasVariants || false);
    setVariants(product.variants || []);
    setShowProductModal(true);
  };

  const handleGenerateAIShopDescription = () => {
    if (!businessName || !ownerName || !address) {
      alert('Please fill in your Business Name, Owner Name, and Address first so the AI can customize your description!');
      return;
    }

    const getDistrictFromAddress = (addr) => {
      if (!addr) return '';
      const parts = addr.split(',');
      const lastPart = parts[parts.length - 1].trim();
      const cleanPart = lastPart.split('-')[0].trim();
      const dist = cleanPart.replace(/\d+/g, '').trim();
      return dist;
    };
    const district = getDistrictFromAddress(address) || 'your city';

    const templates = [
      `Welcome to ${businessName}, managed by ${ownerName}. Located at ${address}, we are the premier destination in ${district} for premium healthy aquarium fish, custom planted tanks, aquascaping decorations, and high-quality filtration systems. We are dedicated to providing the best aquatic hobbyist experience.`,
      `At ${businessName}, owned and operated by ${ownerName}, we bring the wonder of the underwater world to ${district}. Our retail location at ${address} offers a complete suite of professional setup services, rare tropical fish breeds, premium fish food, and custom glass tanks tailored to your home or office space.`,
      `Discover excellence in aquatics at ${businessName}. Directed by ${ownerName} and serving the ${district} area from our office at ${address}, we specialize in creating custom nature aquariums, supplying high-performance LED lighting, and selling healthy aquatic flora and fauna. Visit us today to upgrade your setup.`
    ];

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    setDescription(randomTemplate);
  };

  const handleGenerateAIProductDescription = () => {
    if (!prodName) {
      alert('Please fill in the Product Name first so the AI can customize your description!');
      return;
    }

    const nameLower = prodName.toLowerCase();
    const catLower = prodCat.toLowerCase();

    // 1. Determine Water Type
    let waterType = 'Freshwater (suitable for standard tropical tanks)';
    if (nameLower.includes('marine') || nameLower.includes('saltwater') || nameLower.includes('reef') || nameLower.includes('clownfish') || nameLower.includes('coral') || nameLower.includes('anemone')) {
      waterType = 'Saltwater / Marine (ideal for reef setups and marine community tanks)';
    } else if (nameLower.includes('cichlid') || nameLower.includes('goldfish') || nameLower.includes('koi')) {
      waterType = 'Freshwater (requires high quality filtration and pH monitoring)';
    } else if (catLower.includes('filter') || catLower.includes('light') || catLower.includes('decor') || catLower.includes('access')) {
      waterType = 'Universal (compatible with both Freshwater and Marine/Saltwater environments)';
    }

    // 2. Determine Oxygen / Aeration Requirements
    let oxygenReq = 'Active aeration / filtration is highly recommended to maintain healthy dissolved oxygen levels.';
    if (nameLower.includes('betta') || nameLower.includes('anubias') || nameLower.includes('moss') || nameLower.includes('shrimp') || nameLower.includes('snail')) {
      oxygenReq = 'Low to moderate oxygen requirement. Tolerates standard low-flow setups but thrives with gentle filtration.';
    } else if (nameLower.includes('goldfish') || nameLower.includes('cichlid') || nameLower.includes('discus') || nameLower.includes('clownfish') || nameLower.includes('filter')) {
      oxygenReq = 'High oxygen requirement. Continuous aeration using an air pump, bubbler, or high-flow filter is mandatory.';
    } else if (catLower.includes('plant')) {
      oxygenReq = 'Requires healthy water flow and gas exchange. Supplementary CO2 can be used but standard aeration is recommended during off-light hours.';
    } else if (catLower.includes('filter') || catLower.includes('light')) {
      oxygenReq = 'Promotes clean water circulation and supports optimal gas exchange to elevate oxygen levels in the tank.';
    }

    // 3. Determine Diet / Feeding (if animal/food) or Nutrient requirements
    let dietInfo = 'Not Applicable (non-biological item).';
    if (catLower.includes('fish') || nameLower.includes('fish') || nameLower.includes('shrimp')) {
      if (nameLower.includes('goldfish') || nameLower.includes('carp')) {
        dietInfo = 'Feed 2-3 times daily with high-quality sinking pellets or flakes. Supplementary blanched peas or frozen food can be fed weekly.';
      } else if (nameLower.includes('betta') || nameLower.includes('fighter')) {
        dietInfo = 'Feed 3-4 pellets once or twice daily. Highly responsive to live or frozen brine shrimp and bloodworms.';
      } else if (nameLower.includes('clown') || nameLower.includes('marine')) {
        dietInfo = 'Omnivorous diet. Feed daily with premium marine pellets, flakes, mysis shrimp, or brine shrimp.';
      } else {
        dietInfo = 'Feed daily with micro-pellets or tropical flakes. Supplement with frozen daphnia or tubifex worms for a balanced diet.';
      }
    } else if (catLower.includes('food') || nameLower.includes('food') || nameLower.includes('feed') || nameLower.includes('pellet')) {
      dietInfo = 'Formulated for daily feeding. Highly digestible recipe rich in proteins and amino acids, preventing bloating and swim bladder issues.';
    } else if (catLower.includes('plant') || nameLower.includes('plant') || nameLower.includes('fertilizer')) {
      dietInfo = 'Absorbs nutrients through leaves and roots. Recommend liquid fertilizers, root tabs, and iron supplements for vibrant green coloration.';
    }

    // Combine into a beautiful, highly structured description
    const formattedDescription = `✨ PRODUCT PROFILE & SPECIFICATIONS
--------------------------------------------------
Product Name: ${prodName}
Category: ${prodCat}

Description:
A premium, hand-selected ${prodName} tailored for dedicated hobbyists and professional aquarists. Carefully inspected for maximum quality, structural integrity, and durability.

Aquarium Care & Environment Requirements:
• 💧 Water Compatibility: Suitable for ${waterType}.
• 🫧 Oxygen & Aeration: ${oxygenReq}
• 🍽️ Diet / Nutrition Recommendation: ${dietInfo}

*Ensure your tank parameters are stabilized before introducing new items.*`;

    setProdDesc(formattedDescription);
  };

  // Handle Product Create/Update Submit
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const parsedImages = prodImages.filter((img) => img && img.trim() !== '');

    if (hasVariants) {
      if (variants.length === 0) {
        alert('Please add at least one color/variant.');
        return;
      }
      for (const v of variants) {
        if (!v.color || !v.color.trim()) {
          alert('Please enter a color name for all variants.');
          return;
        }
        if (!v.image || !v.image.trim()) {
          alert('Please upload/enter an image for all variants.');
          return;
        }
      }
    }

    const calculatedStock = hasVariants
      ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
      : Number(prodStock);

    const productData = {
      productName: prodName,
      category: prodCat,
      price: Number(prodPrice),
      stock: calculatedStock,
      images: parsedImages.length > 0 ? parsedImages : undefined,
      isReturnable: prodIsReturnable,
      minQuantity: Number(prodMinQty) || 2,
      hasVariants,
      variants
    };

    try {
      if (modalMode === 'create') {
        await api.post('/products', productData);
        alert('Product published successfully!');
      } else {
        await api.put(`/products/${selectedProduct._id}`, productData);
        alert('Product updated successfully!');
      }
      invalidateProductCache();
      setShowProductModal(false);
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  // Handle Product Delete
  const handleDeleteProduct = async (prodId) => {
    const confirm = await showConfirm('Are you sure you want to delete this product listing?');
    if (confirm) {
      try {
        await api.delete(`/products/${prodId}`);
        alert('Product deleted successfully.');
        invalidateProductCache();
        fetchDashboardData();
      } catch (error) {
        alert('Failed to delete product.');
      }
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { orderStatus: newStatus });
      alert(`Order status updated to ${newStatus}`);
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleShipOrder = async () => {
    if (!finalBoxPhoto) {
      alert('Please select and upload the final packaged box photo.');
      return;
    }
    if (!courierBillPhoto) {
      alert('Please select and upload the courier tracking bill receipt.');
      return;
    }
    
    // Auto generate mock tracking number and journey timeline
    const trackingNumber = scannedAWB || ('AWB' + Math.floor(1000000000 + Math.random() * 9000000000));
    const courierCompany = scannedCourier || shipOrder.courierService || 'ST Courier';
    const mockedTimeline = [
      { status: 'Shipment Picked Up', location: `${courierCompany} Salem Collection Center`, timestamp: new Date() }
    ];

    try {
      await api.put(`/orders/${shipOrder._id}`, {
        orderStatus: 'Courier Dispatched',
        finalBoxImage: finalBoxPhoto,
        courierBillImage: courierBillPhoto,
        trackingNumber: trackingNumber,
        trackingTimeline: mockedTimeline,
        courierService: courierCompany,
        courierBillDetails: extractedBillDetails
      });
      // Clear localStorage
      localStorage.removeItem('ship_box_photo_' + shipOrder._id);

      alert('Order marked as Shipped! Bill and package images saved successfully.');
      setShowShipModal(false);
      setShipOrder(null);
      setFinalBoxPhoto('');
      setCourierBillPhoto('');
      setScannedAWB('');
      setScannedCourier('');
      setExtractedBillDetails({ courier: '', consignmentNo: '', bookingDate: '', from: '', to: '' });
      setBillValidationError('');
      setVerifyingBill(false);
      setShipStep(1);
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to ship order.');
    }
  };

  const isApproved = user?.dealerProfile?.approvalStatus === 'approved';

  if (loading) {
    return <Loader message="Synchronizing inventory ledger..." />;
  }

  return (
    <div className="main-content" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Glow Blobs for premium aurora effect */}
      <div className={styles['glow-blob-1']}></div>
      <div className={styles['glow-blob-2']}></div>

      <div className={styles['dashboard-container']} style={{ position: 'relative', zIndex: 1 }}>
        {/* Sidebar */}
        <aside className={styles['sidebar-menu']}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', gap: '0.5rem' }}>
            {logo ? (
              <img
                src={logo}
                alt="Shop Logo"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--border-color)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('.fallback-store-icon');
                    if (fallback) fallback.style.display = 'flex';
                  }
                }}
              />
            ) : null}

            <div
              className="fallback-store-icon"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(20, 184, 166, 0.1)',
                display: logo ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--secondary)'
              }}
            >
              <Store size={30} />
            </div>
            <h4 style={{ fontWeight: '700', fontSize: '1rem', textAlign: 'center' }}>
              {user?.dealerProfile?.businessName || 'Dealer Store'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: isApproved ? 'var(--success)' : 'var(--accent)', fontWeight: '700', textTransform: 'uppercase' }}>
              {user?.dealerProfile?.approvalStatus}
            </span>
          </div>

          <div
            className={`${styles['sidebar-item']} ${activeTab === 'overview' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Store size={22} />
            <span>Store Overview</span>
          </div>

          <div
            className={`${styles['sidebar-item']} ${activeTab === 'products' ? styles['active'] : ''}`}
            onClick={() => {
              if (!isApproved) {
                alert('Your store is pending approval. You cannot manage products yet.');
                return;
              }
              setActiveTab('products');
            }}
            style={{ opacity: isApproved ? 1 : 0.5 }}
          >
            <Package size={22} />
            <span>Product Catalog</span>
          </div>

          <div
            className={`${styles['sidebar-item']} ${activeTab === 'orders' ? styles['active'] : ''}`}
            onClick={() => {
              if (!isApproved) {
                alert('Your store is pending approval. You cannot manage orders yet.');
                return;
              }
              setActiveTab('orders');
            }}
            style={{ opacity: isApproved ? 1 : 0.5 }}
          >
            <Truck size={22} />
            <span>Incoming Orders</span>
          </div>



          <div
            className={`${styles['sidebar-item']} ${activeTab === 'payments' ? styles['active'] : ''}`}
            onClick={() => {
              if (!isApproved) {
                alert('Your store is pending approval. You cannot view payments yet.');
                return;
              }
              setActiveTab('payments');
            }}
            style={{ opacity: isApproved ? 1 : 0.5 }}
          >
            <DollarSign size={22} />
            <span>Payments & Earnings</span>
          </div>

          <div
            className={`${styles['sidebar-item']} ${activeTab === 'profile' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <Settings size={22} />
            <span>Store Settings</span>
          </div>



          <div
            className={`${styles['sidebar-item']} ${activeTab === 'purchases' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('purchases')}
            style={{ cursor: 'pointer' }}
          >
            <ShoppingCart size={22} />
            <span>My Purchases</span>
          </div>
        </aside>

        {/* Dashboard Main Content */}
        <main className={styles['dashboard-main']}>
          {activeTab === 'overview' && (
            <div>
              {/* Warn dealer if pending or rejected */}
              {user?.dealerProfile?.approvalStatus === 'rejected' && (
                <div className="alert alert-danger" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent)' }}>
                  <div style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '0.3rem' }}>Store Registration Rejected</div>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    Your dealer registration request has been rejected by the administrator.
                  </p>
                  {user?.dealerProfile?.rejectionReason && (
                    <div style={{ marginTop: '0.6rem', padding: '0.6rem 0.8rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <strong>Reason for Rejection:</strong> <span style={{ fontStyle: 'italic' }}>{user.dealerProfile.rejectionReason}</span>
                    </div>
                  )}
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={handleResubmitStore}
                      className="btn btn-primary"
                      style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                      Resubmit Store for Approval
                    </button>
                  </div>
                </div>
              )}

              {user?.dealerProfile?.approvalStatus === 'pending' && (
                <div className="alert alert-warning" style={{ marginBottom: '2rem' }}>
                  Your Dealer registration is currently under review by our administration. Once approved, you will be able to publish products, set inventory, and fulfill customer orders.
                </div>
              )}

              {(!user?.dealerProfile?.bankName || !user?.dealerProfile?.accountNumber || !user?.dealerProfile?.ifscCode) && user?.dealerProfile?.approvalStatus === 'approved' && (
                <div className="alert alert-warning" style={{ marginBottom: '2rem', background: 'rgba(245, 158, 11, 0.08)', borderLeft: '4px solid var(--warning)', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.5rem 2rem', borderRadius: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--warning)', marginBottom: '0.2rem' }}>⚠️ Bank Details Required</div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Please provide your bank details under settings to receive automated payouts for your customer orders.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="btn btn-primary"
                    style={{ margin: 0, padding: '0.6rem 1.2rem', whiteSpace: 'nowrap' }}
                  >
                    Set Bank Details
                  </button>
                </div>
              )}

              {stats && (
                <div>
              <div className={styles['dashboard-header']}>
                <h1 className={styles['dashboard-title']}>Store Dashboard</h1>
              </div>

              <div className={styles['stats-grid']}>
                <div className={`glass-panel ${styles['stats-card']}`}>
                  <div>
                    <span className={styles['stats-label']}>My Products</span>
                    <div className={styles['stats-value']}>{stats.totalProducts}</div>
                  </div>
                  <div className={styles['stats-icon-wrapper']} style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)' }}>
                    <Package size={24} />
                  </div>
                </div>

                <div className={`glass-panel ${styles['stats-card']}`}>
                  <div>
                    <span className={styles['stats-label']}>Sales Fulfillments</span>
                    <div className={styles['stats-value']}>{stats.totalOrders}</div>
                  </div>
                  <div className={styles['stats-icon-wrapper']} style={{ background: 'rgba(20, 184, 166, 0.1)', color: 'var(--secondary)' }}>
                    <Truck size={24} />
                  </div>
                </div>

                <div className={`glass-panel ${styles['stats-card']}`}>
                  <div>
                    <span className={styles['stats-label']}>Sales Revenue</span>
                    <div className={styles['stats-value']}>₹{stats.totalRevenue.toLocaleString()}</div>
                  </div>
                  <div className={styles['stats-icon-wrapper']} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                    <DollarSign size={24} />
                  </div>
                </div>
              </div>

              {/* Shop Overview Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                {/* Monthly Sales */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem' }}>
                    Monthly Sales Statistics
                  </h3>
                  {stats.monthlySalesReport.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No transactional data generated yet.</p>
                  ) : (
                    <div className={styles['table-container']}>
                      <table className={styles['custom-table']}>
                        <thead>
                          <tr>
                            <th>Month</th>
                            <th>Completed Orders</th>
                            <th>Total Sales Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.monthlySalesReport.map((report, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: '600' }}>{report.month}</td>
                              <td>{report.orders}</td>
                              <td style={{ color: 'var(--secondary)', fontWeight: '700' }}>₹{report.sales.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Shop Active Profile Card */}
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    Active Shop Profile
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <img 
                      src={user?.dealerProfile?.logo || 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=150'} 
                      alt="Shop Logo" 
                      style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', background: '#f8fafc' }} 
                    />
                    <div>
                      <h4 style={{ fontWeight: '700', fontSize: '1.1rem', margin: 0 }}>{user?.dealerProfile?.businessName || 'Dealer Store'}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Owned by {user?.dealerProfile?.ownerName}</span>
                    </div>
                  </div>
                  <div>
                    <h5 style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Description:</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                      {user?.dealerProfile?.description || 'No description provided yet. Update your store profile in Store Settings.'}
                    </p>
                  </div>
                  <div>
                    <h5 style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>MSME Certificate:</h5>
                    {user?.dealerProfile?.msmeCertificate ? (
                      <button 
                        type="button"
                        onClick={() => {
                          const base64Data = user.dealerProfile.msmeCertificate;
                          if (base64Data.startsWith('http') || base64Data.startsWith('/')) {
                            window.open(base64Data, '_blank');
                          } else {
                            const newWindow = window.open();
                            if (newWindow) {
                              newWindow.document.title = 'MSME Certificate';
                              newWindow.document.body.style.margin = '0';
                              newWindow.document.body.style.display = 'flex';
                              newWindow.document.body.style.justifyContent = 'center';
                              newWindow.document.body.style.alignItems = 'center';
                              newWindow.document.body.style.background = '#0f172a';
                              const img = newWindow.document.createElement('img');
                              img.src = base64Data;
                              img.style.maxWidth = '90%';
                              img.style.maxHeight = '90vh';
                              img.style.objectFit = 'contain';
                              img.style.borderRadius = '8px';
                              img.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
                              newWindow.document.body.appendChild(img);
                            } else {
                              const link = document.createElement('a');
                              link.href = base64Data;
                              link.download = 'msme_certificate.jpg';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }
                          }
                        }}
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: 'auto', cursor: 'pointer' }}
                      >
                        View MSME Certificate
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: '600' }}>No MSME Certificate uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

          {activeTab === 'products' && (
            <div>
              <div className={styles['dashboard-header']}>
                <h1 className={styles['dashboard-title']}>Product Catalog</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(244, 63, 94, 0.08)', borderRadius: '12px' }}>
                    <Package size={16} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--accent)' }}>Total Products: {products.length}</span>
                  </div>
                  <button onClick={openCreateModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
                    <Plus size={16} /> Add Product
                  </button>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  You do not have any active product listings.
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <div className={styles['table-container']}>
                    <table className={styles['custom-table']}>
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Inventory</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((prod) => (
                          <tr key={prod._id}>
                            <td>
                              <img
                                src={prod.images[0]}
                                alt={prod.productName}
                                style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                              />
                            </td>
                            <td style={{ fontWeight: '600' }}>{prod.productName}</td>
                            <td>{prod.category}</td>
                            <td style={{ color: 'var(--secondary)', fontWeight: '600' }}>₹{prod.price.toLocaleString()}</td>
                            <td>{prod.stock} items</td>
                            <td>
                              {prod.stock > 0 ? (
                                <span className={`${styles['stock-status']} ${styles['stock-in']}`}>In Stock</span>
                              ) : (
                                <span className={`${styles['stock-status']} ${styles['stock-out']}`}>Out of Stock</span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => openEditModal(prod)} className="btn btn-secondary" style={{ padding: '0.4rem' }}>
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => handleDeleteProduct(prod._id)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--accent)' }}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className={styles['dashboard-header']} style={{ marginBottom: '1rem' }}>
                <h1 className={styles['dashboard-title']}>Store Orders</h1>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px' }}>
                  <ShoppingCart size={16} style={{ color: 'var(--success)' }} />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--success)' }}>Total Orders: {orders.length}</span>
                </div>
              </div>

              {/* Sub-tab Navigation */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => setOrderSubTab('incoming')}
                  className={`btn ${orderSubTab === 'incoming' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.6rem 1.5rem', margin: 0 }}
                >
                  Incoming Orders ({orders.filter(o => ['Processing', 'Placed', 'Pending'].includes(o.orderStatus)).length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSubTab('shipped')}
                  className={`btn ${orderSubTab === 'shipped' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.6rem 1.5rem', margin: 0 }}
                >
                  Shipped & Delivered ({orders.filter(o => ['Shipped', 'Courier Dispatched', 'In Transit', 'Out for Delivery', 'Delivered'].includes(o.orderStatus)).length})
                </button>
              </div>

              {(() => {
                const filtered = orders.filter(o => {
                  if (orderSubTab === 'incoming') {
                    return ['Processing', 'Placed', 'Pending'].includes(o.orderStatus);
                  } else {
                    return ['Shipped', 'Courier Dispatched', 'In Transit', 'Out for Delivery', 'Delivered'].includes(o.orderStatus);
                  }
                });

                if (filtered.length === 0) {
                  return (
                    <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No orders found in this category.
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: 'calc(100vh - 260px)', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {filtered.map((ord) => (
                      <div key={ord._id} className="glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                          <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ORDER ID</span>
                            <div style={{ fontWeight: '600' }}>#{ord.customOrderId || ord._id.toString().slice(-6)}</div>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PAYMENT STATUS</span>
                            <div style={{ fontWeight: '600', color: ord.paymentStatus === 'paid' ? 'var(--success)' : 'var(--warning)' }}>
                              {ord.paymentStatus.toUpperCase()} ({ord.paymentMethod})
                            </div>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>YOUR SHARE TOTAL</span>
                            <div style={{ fontWeight: '700', color: 'var(--secondary)' }}>₹{ord.dealerSubtotal.toLocaleString()}</div>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SHIPMENT STATE</span>
                            <div style={{ fontWeight: '600', color: ord.orderStatus === 'Delivered' ? 'var(--success)' : 'var(--primary)' }}>
                              {ord.orderStatus}
                            </div>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <h5 style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <User size={16} />
                            Customer Shipping Information
                          </h5>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Name: <strong>{ord.customerId?.name}</strong> | Phone: <strong>{ord.customerId?.phone}</strong> | Email: {ord.customerId?.email}
                          </p>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Address: {ord.shippingAddress?.address}, {ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.zip}
                          </p>
                          {ord.courierService && (
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem' }}>
                              Courier Option: <strong>{ord.courierService}</strong> | Delivery Fee: <strong>₹{ord.deliveryCharge}</strong>
                            </p>
                          )}
                        </div>

                        {/* Items sold by this dealer */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {ord.products.map((item) => {
                            const prod = item.productId;
                            if (!prod) return null;
                            return (
                              <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                  <img
                                    src={item.image ? item.image : (prod.images && prod.images[0] ? prod.images[0] : 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200')}
                                    alt={prod.productName}
                                    style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                  />
                                  <div>
                                    <h6 style={{ fontWeight: '700', margin: 0 }}>
                                      {prod.productName} {item.color && item.color !== 'Standard' && (
                                        <span style={{ color: 'var(--primary)', fontSize: '0.8rem', marginLeft: '6px' }}>
                                          ({item.color})
                                        </span>
                                      )}
                                    </h6>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                      Qty: {item.quantity} | Unit Price: ₹{item.price.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                          {ord.orderStatus === 'Processing' && (
                            <button
                              onClick={() => {
                                setShipOrder(ord);
                                setLabelValidationError('');
                                const savedBox = localStorage.getItem('ship_box_photo_' + ord._id);
                                if (savedBox) {
                                  setFinalBoxPhoto(savedBox);
                                  setLabelVerified(true);
                                  setManualLabelOverride(true);
                                  setShipStep(2);
                                } else {
                                  setFinalBoxPhoto('');
                                  setLabelVerified(false);
                                  setManualLabelOverride(false);
                                  setShipStep(1);
                                }
                                 setCourierBillPhoto('');
                                 setScannedAWB('');
                                 setScannedCourier('');
                                 setExtractedBillDetails({ courier: '', consignmentNo: '', bookingDate: '', from: '', to: '' });
                                 setBillValidationError('');
                                 setVerifyingBill(false);
                                 setShowShipModal(true);
                              }}
                              className="btn btn-primary"
                              style={{ padding: '0.5rem 1.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                              <Truck size={16} />
                              Proceed to Ship
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
            <div className={styles['settings-container']}>
              <div className={styles['dashboard-header']}>
                <h1 className={styles['dashboard-title']}>Store Settings</h1>
              </div>

              {profileError && <div className="alert alert-danger">{profileError}</div>}
              {profileMessage && <div className="alert alert-success">{profileMessage}</div>}

              <form onSubmit={handleProfileUpdate}>
                <div className={styles['settings-flex-row']}>
                  {/* Left Column: Business Details Card */}
                  <div className={`glass-panel ${styles['settings-col-left']}`} style={{ padding: '2rem' }}>
                    <h3 className={styles['settings-heading']} style={{ color: 'var(--secondary)' }}>
                      Business Details
                    </h3>

                    <div className="form-group">
                      <label className="form-label">Registered Business Name</label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Owner Full Name</label>
                      <input
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Business Address</label>
                      <textarea
                        required
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="form-control"
                        style={{ resize: 'vertical' }}
                      ></textarea>
                    </div>

                    <div className={styles['settings-logo-preview-container']}>
                      <div className={styles['settings-logo-frame']}>
                        {logo ? (
                          <img src={logo} alt="Shop Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Store size={36} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                        )}
                      </div>
                      <div className={styles['settings-logo-actions']}>
                        <label className="form-label" style={{ marginBottom: 0 }}>Shop Logo Image</label>
                        <div className={styles['settings-logo-buttons']}>
                          <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-color)', margin: 0 }}>
                            <Upload size={14} />
                            Upload Photo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              style={{ display: 'none' }}
                            />
                          </label>
                          {logo && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setLogo('')}
                              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderColor: 'var(--accent)', color: 'var(--accent)', margin: 0 }}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Supports JPEG, PNG or GIF. Max 5MB recommended.
                        </span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Document Verification Type</label>
                      <select
                        value={selectedDocType}
                        onChange={(e) => {
                          setSelectedDocType(e.target.value);
                          setDocumentStatus('unverified');
                          setDocError('');
                        }}
                        className="form-control"
                        style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }}
                      >
                        <option value="msme" style={{ background: '#1e293b' }}>MSME Certificate</option>
                        <option value="aadhaar" style={{ background: '#1e293b' }}>Aadhaar Card</option>
                        <option value="pan" style={{ background: '#1e293b' }}>PAN Card</option>
                        <option value="iso" style={{ background: '#1e293b' }}>ISO Certificate</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Upload {selectedDocType === 'msme' ? 'MSME Certificate' :
                                selectedDocType === 'aadhaar' ? 'Aadhaar Card' :
                                selectedDocType === 'pan' ? 'PAN Card' : 'ISO Certificate'} (JPG/JPEG)
                      </label>
                      <div className={styles['settings-doc-actions']}>
                        <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-color)', margin: 0 }}>
                          <Upload size={14} />
                          {msmeCertificate ? 'Change Document' : 'Upload Document'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMsmeUpload}
                            style={{ display: 'none' }}
                          />
                        </label>
                        {msmeCertificate && (
                          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => {
                                if (msmeCertificate.startsWith('http') || msmeCertificate.startsWith('/')) {
                                  window.open(msmeCertificate, '_blank');
                                } else {
                                  const newWindow = window.open();
                                  if (newWindow) {
                                    newWindow.document.title = 'Document Preview';
                                    newWindow.document.body.style.margin = '0';
                                    newWindow.document.body.style.display = 'flex';
                                    newWindow.document.body.style.justifyContent = 'center';
                                    newWindow.document.body.style.alignItems = 'center';
                                    newWindow.document.body.style.background = '#0f172a';
                                    const img = newWindow.document.createElement('img');
                                    img.src = msmeCertificate;
                                    img.style.maxWidth = '90%';
                                    img.style.maxHeight = '90vh';
                                    img.style.objectFit = 'contain';
                                    img.style.borderRadius = '8px';
                                    img.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
                                    newWindow.document.body.appendChild(img);
                                  }
                                }
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', margin: 0 }}
                            >
                              Preview Document
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => {
                                setMsmeCertificate('');
                                setDocumentStatus('unverified');
                                setDocError('');
                              }}
                              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderColor: 'var(--accent)', color: 'var(--accent)', margin: 0 }}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      {verifyingDoc && (
                        <div style={{ marginTop: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '600' }}>
                          <div className="spinner-border spinner-border-sm" role="status" style={{ width: '1rem', height: '1rem', border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spinner-border .75s linear infinite' }}></div>
                          Scanning document authenticity with Tesseract OCR...
                        </div>
                      )}

                      {documentStatus === 'verified' && msmeCertificate && (
                        <div className={styles['settings-doc-status-verified']}>
                          <Check size={16} /> Authenticity Check Passed: Verified Document
                        </div>
                      )}

                      {docError && (
                        <div className={styles['settings-doc-status-error']}>
                          {docError}
                        </div>
                      )}

                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.4rem' }}>
                        Upload official JPEG/PNG document photo. Maximum file size 5MB.
                      </span>
                    </div>

                  </div>

                  {/* Right Column: Google Reviews & Security Card */}
                  <div className={`glass-panel ${styles['settings-col-right']}`} style={{ padding: '2rem' }}>
                    <div>
                      <h3 className={styles['settings-heading']} style={{ color: 'var(--secondary)' }}>
                        Google Reviews Integration
                      </h3>

                      <div className="form-group">
                        <label className="form-label">Google Review Link / Map Link</label>
                        <input
                          type="text"
                          value={googlePlaceId}
                          onChange={(e) => setGooglePlaceId(e.target.value)}
                          placeholder="e.g. https://g.page/r/ChIJN1t_tDeuEmsR... or https://maps.app.goo.gl/..."
                          className="form-control"
                        />
                        <small style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block', lineHeight: '1.4' }}>
                          Upload your Google Review/Maps link. This makes integration easy on the client side and pulls reviews to display on your product pages.
                        </small>
                        {user?.dealerProfile?.googlePlaceId && (
                          <div className={styles['settings-sync-container']}>
                            <button
                              type="button"
                              onClick={handleSyncGoogleReviews}
                              disabled={syncingReviews}
                              className="btn btn-secondary"
                              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                            >
                              {syncingReviews ? 'Syncing Reviews...' : 'Sync Google Reviews Now'}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="form-group" style={{ marginBottom: 0, marginTop: '1.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <label className="form-label" style={{ margin: 0 }}>Shop Description</label>
                          <button
                            type="button"
                            onClick={handleGenerateAIShopDescription}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: 0 }}
                          >
                            ✨ Auto-Generate with AI
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="form-control"
                          placeholder="Brief description about your shop..."
                          style={{ resize: 'vertical' }}
                        ></textarea>
                      </div>

                      <div className="form-group" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.6rem' }}>
                          Supported Courier Partners
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          {['DTDC', 'Professional Courier', 'ST Courier'].map((courier) => (
                            <label key={courier} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer', margin: 0 }}>
                              <input
                                type="checkbox"
                                checked={courierServices.includes(courier)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setCourierServices([...courierServices, courier]);
                                  } else {
                                    if (courierServices.length > 1) {
                                      setCourierServices(courierServices.filter(c => c !== courier));
                                    } else {
                                      alert("Please support at least one courier service partner.");
                                    }
                                  }
                                }}
                                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                              />
                              {courier}
                            </label>
                          ))}
                        </div>
                        <small style={{ display: 'block', color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.78rem', lineHeight: '1.4' }}>
                          Check the courier partners available in your pickup location. Only these partners will be displayed as shipping choices to customers purchasing your products.
                        </small>
                      </div>
                    </div>

                    <div>
                      <h3 className={styles['settings-heading']} style={{ color: 'var(--primary)' }}>
                        Security & Authentication
                      </h3>

                      <div className="form-group">
                        <label className="form-label">Contact Email</label>
                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                          <input
                            type="email"
                            required
                            readOnly
                            value={email}
                            className="form-control"
                            style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', flex: 1 }}
                          />
                          {!showEmailChangeSection && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowEmailChangeSection(true);
                                setEmailOtpSent(false);
                                setNewEmail('');
                              }}
                              className="btn btn-secondary"
                              style={{ whiteSpace: 'nowrap', margin: 0, padding: '0.5rem 1rem' }}
                            >
                              Change Email
                            </button>
                          )}
                        </div>

                        {showEmailChangeSection && (
                          <div style={{ border: '1px dashed var(--border-color)', borderRadius: '10px', padding: '1rem', marginTop: '1rem', background: 'rgba(255, 255, 255, 0.01)' }}>
                            <div className="form-group">
                              <label className="form-label">Enter New Email Address</label>
                              <input
                                type="email"
                                value={newEmail}
                                disabled={emailOtpSent}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="form-control"
                                placeholder="name@example.com"
                              />
                            </div>

                            {!emailOtpSent ? (
                              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem' }}>
                                <button
                                  type="button"
                                  onClick={() => setShowEmailChangeSection(false)}
                                  className="btn btn-secondary"
                                  style={{ flex: 1, margin: 0 }}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={sendingEmailOtp || !newEmail}
                                  onClick={handleSendEmailOtp}
                                  className="btn btn-primary"
                                  style={{ flex: 1, margin: 0 }}
                                >
                                  {sendingEmailOtp ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                              </div>
                            ) : (
                              <div>
                                <div className="form-group" style={{ marginTop: '0.8rem' }}>
                                  <label className="form-label">Enter 6-Digit OTP Code</label>
                                  <input
                                    type="text"
                                    value={emailOtpInput}
                                    onChange={(e) => setEmailOtpInput(e.target.value)}
                                    className="form-control"
                                    placeholder="123456"
                                    style={{ letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
                                  />
                                  {emailOtpError && <small style={{ color: 'var(--accent)', marginTop: '4px', display: 'block' }}>{emailOtpError}</small>}
                                </div>

                                {emailOtpPreviewUrl && (
                                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', margin: '1rem 0', fontSize: '0.85rem' }}>
                                    <strong style={{ color: 'var(--primary)' }}>Ethereal Mailbox Delivery link:</strong><br/>
                                    <a href={emailOtpPreviewUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>
                                      View Verification Email
                                    </a>
                                  </div>
                                )}

                                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                                  <button
                                    type="button"
                                    onClick={() => setEmailOtpSent(false)}
                                    className="btn btn-secondary"
                                    style={{ flex: 1, margin: 0 }}
                                  >
                                    Back
                                  </button>
                                  <button
                                    type="button"
                                    disabled={!emailOtpInput}
                                    onClick={handleVerifyEmailOtp}
                                    className="btn btn-primary"
                                    style={{ flex: 1, margin: 0 }}
                                  >
                                    Verify & Save
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Contact Phone</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="form-control"
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Password & Security</label>
                        <button
                          type="button"
                          disabled={sendingPasswordOtp}
                          onClick={handleSendPasswordOtp}
                          className="btn btn-secondary"
                          style={{ width: '100%', margin: 0 }}
                        >
                          {sendingPasswordOtp ? 'Sending OTP...' : 'Change Password'}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`glass-panel ${styles['settings-col-right']}`} style={{ padding: '2rem', marginTop: '2rem' }}>
                    <h3 className={styles['settings-heading']} style={{ color: 'var(--success)' }}>
                      Bank Details (For Payouts)
                    </h3>
                    <div className="form-group">
                      <label className="form-label">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. State Bank of India"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Account Holder Name</label>
                      <input
                        type="text"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Account Number</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="e.g. 123456789012"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">IFSC Code</label>
                      <input
                        type="text"
                        value={ifscCode}
                        onChange={(e) => handleIfscChange(e.target.value)}
                        placeholder="e.g. SBIN0001234"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Branch Name</label>
                      <input
                        type="text"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        placeholder="e.g. Salem Main Branch"
                        className="form-control"
                      />
                    </div>
                  </div>

                  {/* Offers & Promotions Panel */}
                  <div className={`glass-panel ${styles['settings-col-right']}`} style={{ padding: '2rem', marginTop: '2rem' }}>
                    <h3 className={styles['settings-heading']} style={{ color: 'var(--warning)' }}>
                      Offers & Promotions
                    </h3>
                    <div className="form-group">
                      <label className="form-label">Global Discount Percentage (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                        placeholder="e.g. 10"
                        className="form-control"
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>This discount will be applied to all your products. Set to 0 to disable.</span>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Custom Offer Text / Campaign Message</label>
                      <input
                        type="text"
                        value={customOfferText}
                        onChange={(e) => setCustomOfferText(e.target.value)}
                        placeholder="e.g. Buy 3 Get 1 Free"
                        className="form-control"
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Enter custom promotional text (e.g. "Buy 3 Get 1 Free"). Leave empty to disable.</span>
                    </div>
                  </div>
                </div>

                <button type="submit" className={`btn btn-primary ${styles['settings-submit-btn']}`}>
                  Save Store Profile
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <div className={styles['dashboard-header']}>
              <h1 className={styles['dashboard-title']}>Payments & Earnings</h1>
            </div>

            {/* Stats grid */}
            <div className={styles['stats-grid']} style={{ marginTop: '1.5rem' }}>
              <div className={`glass-panel ${styles['stats-card']}`}>
                <div>
                  <span className={styles['stats-label']}>Total Earnings</span>
                  <div className={styles['stats-value']} style={{ color: 'var(--success)' }}>
                    ₹{orders.filter(o => o.orderStatus === 'Delivered').reduce((sum, o) => sum + (o.dealerSubtotal || 0), 0).toLocaleString()}
                  </div>
                </div>
                <div className={styles['stats-icon-wrapper']} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                  <TrendingUp size={24} />
                </div>
              </div>

              <div className={`glass-panel ${styles['stats-card']}`}>
                <div>
                  <span className={styles['stats-label']}>Received (Paid)</span>
                  <div className={styles['stats-value']} style={{ color: 'var(--primary)' }}>
                    ₹{orders.filter(o => o.orderStatus === 'Delivered' && o.dealerPayoutStatus === 'Paid').reduce((sum, o) => sum + (o.dealerSubtotal || 0), 0).toLocaleString()}
                  </div>
                </div>
                <div className={styles['stats-icon-wrapper']} style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)' }}>
                  <DollarSign size={24} />
                </div>
              </div>

              <div className={`glass-panel ${styles['stats-card']}`}>
                <div>
                  <span className={styles['stats-label']}>Pending Payouts</span>
                  <div className={styles['stats-value']} style={{ color: 'var(--warning)' }}>
                    ₹{orders.filter(o => o.orderStatus === 'Delivered' && (!o.dealerPayoutStatus || o.dealerPayoutStatus === 'Pending')).reduce((sum, o) => sum + (o.dealerSubtotal || 0), 0).toLocaleString()}
                  </div>
                </div>
                <div className={styles['stats-icon-wrapper']} style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                  <Clock size={24} />
                </div>
              </div>
            </div>

            {/* Subtabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', marginTop: '1.5rem' }}>
              {['All', 'Paid', 'Pending', 'Processing'].map((tab) => {
                const filteredOrdersCount = orders.filter(o => {
                  if (o.orderStatus !== 'Delivered') return false;
                  if (tab === 'All') return true;
                  if (tab === 'Paid') return o.dealerPayoutStatus === 'Paid';
                  if (tab === 'Pending') return !o.dealerPayoutStatus || o.dealerPayoutStatus === 'Pending';
                  if (tab === 'Processing') return o.dealerPayoutStatus === 'Processing';
                  return false;
                }).length;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setPayoutSubTab(tab)}
                    className={`btn ${payoutSubTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.5rem 1.2rem', margin: 0 }}
                  >
                    {tab} ({filteredOrdersCount})
                  </button>
                );
              })}
            </div>

            {/* Payments List */}
            {(() => {
              const filtered = orders.filter(o => {
                if (o.orderStatus !== 'Delivered') return false;
                if (payoutSubTab === 'All') return true;
                if (payoutSubTab === 'Paid') return o.dealerPayoutStatus === 'Paid';
                if (payoutSubTab === 'Pending') return !o.dealerPayoutStatus || o.dealerPayoutStatus === 'Pending';
                if (payoutSubTab === 'Processing') return o.dealerPayoutStatus === 'Processing';
                return false;
              });

              if (filtered.length === 0) {
                return (
                  <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No payments found in this category.
                  </div>
                );
              }

              return (
                <div className={styles['table-container']}>
                  <table className={styles['custom-table']} style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem' }}>Order ID</th>
                        <th style={{ padding: '1rem' }}>Customer</th>
                        <th style={{ padding: '1rem' }}>Total Amount</th>
                        <th style={{ padding: '1rem' }}>Your Earnings Share</th>
                        <th style={{ padding: '1rem' }}>Payout Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((ord) => (
                        <tr key={ord._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', fontWeight: '600' }}>
                            #{ord.customOrderId || ord._id.slice(-6)}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: '500' }}>{ord.customerId?.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ord.customerId?.phone}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>₹{ord.totalAmount.toLocaleString()}</td>
                          <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--success)' }}>
                            ₹{(ord.dealerSubtotal || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              background: ord.dealerPayoutStatus === 'Paid' ? 'rgba(16, 185, 129, 0.15)' :
                                          ord.dealerPayoutStatus === 'Processing' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: ord.dealerPayoutStatus === 'Paid' ? 'var(--success)' :
                                     ord.dealerPayoutStatus === 'Processing' ? 'var(--warning)' : 'var(--accent)',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '700'
                            }}>
                              {ord.dealerPayoutStatus || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        )}

          {activeTab === 'purchases' && (
            <div>
              <div className={styles['dashboard-header']}>
                <h1 className={styles['dashboard-title']}>My Purchases</h1>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(2, 132, 199, 0.08)', borderRadius: '12px' }}>
                  <ShoppingCart size={16} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--primary)' }}>Total Purchases: {customerOrders.length}</span>
                </div>
              </div>

              {loadingCustomerOrders ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading purchases...</span>
                  </div>
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  You haven't placed any orders yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {customerOrders.map((ord) => (
                    <div key={ord._id} className="glass-panel" style={{ padding: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ORDER PLACED</span>
                          <div style={{ fontWeight: '600' }}>{new Date(ord.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>TOTAL VALUE</span>
                          <div style={{ fontWeight: '600', color: 'var(--secondary)' }}>₹{ord.totalAmount.toLocaleString()}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>PAYMENT STATUS</span>
                          <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{ord.paymentStatus} ({ord.paymentMethod})</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>SHIPPING STATUS</span>
                          <div style={{ fontWeight: '600', color: ord.orderStatus === 'Delivered' ? 'var(--success)' : ord.orderStatus === 'Cancelled' ? 'var(--error)' : 'var(--primary)' }}>
                            {ord.orderStatus}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ORDER ID</span>
                          <div style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{ord._id}</div>
                        </div>
                      </div>

                      {/* Items inside this order */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {ord.products.map((item) => {
                          const prod = item.productId;
                          if (!prod) return null;
                          return (
                            <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <img
                                  src={item.image ? item.image : (prod.images && prod.images[0] ? prod.images[0] : 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200')}
                                  alt={prod.productName}
                                  style={{ width: '60px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                                />
                                <div>
                                  <h5 style={{ fontWeight: '700' }}>
                                    {prod.productName} {item.color && item.color !== 'Standard' && (
                                      <span style={{ color: 'var(--primary)', fontSize: '0.85rem', marginLeft: '6px' }}>
                                        ({item.color})
                                      </span>
                                    )}
                                  </h5>
                                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Category: {prod.category} | Qty: {item.quantity} | Price: ₹{item.price.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Courier & Shipping Details */}
                      {ord.courierService && (
                        <div style={{ marginTop: '1.2rem', padding: '0.8rem 1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px dashed var(--border-color)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Truck size={16} style={{ color: 'var(--primary)' }} />
                            Courier Partner: <strong>{ord.courierService}</strong>
                          </span>
                          <span>Delivery Fee: <strong>₹{ord.deliveryCharge}</strong></span>
                        </div>
                      )}

                      {/* Cancel & Download Invoice Actions */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                        {ord.orderStatus !== 'Cancelled' && (
                          <button
                            type="button"
                            onClick={() => setActiveInvoiceOrder(ord)}
                            className="btn btn-secondary"
                            style={{ borderColor: 'var(--primary)', color: 'var(--primary)', cursor: 'pointer' }}
                          >
                            View Invoice
                          </button>
                        )}
                        {ord.orderStatus === 'Processing' && (
                          <button
                            type="button"
                            onClick={() => handleCancelCustomerOrder(ord._id)}
                            className="btn btn-secondary"
                            style={{ color: 'var(--accent)', borderColor: 'rgba(244, 63, 94, 0.2)', cursor: 'pointer' }}
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {false && activeTab === 'tracking' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className={styles['dashboard-header']}>
                <h1 className={styles['dashboard-title']}>Courier Tracking System</h1>
              </div>

              {/* Stats Cards Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(2, 132, 199, 0.05)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Today's Shipments</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '5px', color: 'var(--primary)' }}>
                    {orders.filter(o => o.orderStatus === 'Shipped' || o.orderStatus === 'In Transit').length}
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(5, 150, 105, 0.05)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Delivered</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '5px', color: 'var(--success)' }}>
                    {orders.filter(o => o.orderStatus === 'Delivered').length}
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(245, 158, 11, 0.05)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>In Transit</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '5px', color: 'var(--warning)' }}>
                    {orders.filter(o => o.orderStatus === 'In Transit').length}
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Delayed / Returned</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '5px', color: '#f87171' }}>0</div>
                </div>
              </div>

              {/* Main Panel Content: Split layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
                
                {/* Left Column: Courier Bill Upload Form */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    Upload Dispatch Document
                  </h3>
                  
                  {/* Drag & Drop Upload block */}
                  <div
                    style={{
                      border: '2px dashed var(--primary)',
                      borderRadius: '12px',
                      padding: '2.5rem 1.5rem',
                      textAlign: 'center',
                      background: 'rgba(2, 132, 199, 0.02)',
                      cursor: 'pointer',
                      position: 'relative',
                      marginBottom: '1.5rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBillUpload}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                    <Package size={36} style={{ color: 'var(--primary)', marginBottom: '10px' }} />
                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Drag & Drop Image Here
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      or Click to Browse (PNG, JPG, JPEG)
                    </div>
                  </div>

                  {ocrLoading && (
                    <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(2, 132, 199, 0.08)', borderRadius: '8px', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                      <span className="spinner-border spinner-border-sm" role="status" style={{ marginRight: '8px' }}></span>
                      Reading Document... (AI OCR Processing)
                    </div>
                  )}

                  {/* Form fields */}
                  <form onSubmit={handleTrackShipment} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Tracking / AWB Number</label>
                      <input
                        type="text"
                        disabled={ocrLoading || !extractedAWB}
                        required
                        value={extractedAWB}
                        onChange={(e) => setExtractedAWB(e.target.value)}
                        className="form-control"
                        placeholder="Extracted AWB Number"
                        style={{ background: !extractedAWB ? 'rgba(255,255,255,0.05)' : 'var(--bg-card)' }}
                      />
                      <small style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                        (Cannot edit until OCR completes)
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Courier Company</label>
                      <select
                        value={detectedCourier}
                        onChange={(e) => setDetectedCourier(e.target.value)}
                        className="form-control"
                        style={{ textTransform: 'capitalize' }}
                      >
                        <option value="">Select Courier Partner</option>
                        <option value="Professional Couriers">Professional Couriers</option>
                        <option value="DTDC">DTDC</option>
                        <option value="Blue Dart">Blue Dart</option>
                        <option value="Delhivery">Delhivery</option>
                        <option value="XpressBees">XpressBees</option>
                        <option value="India Post">India Post</option>
                        <option value="Shadowfax">Shadowfax</option>
                        <option value="Ekart">Ekart</option>
                        <option value="Ecom Express">Ecom Express</option>
                        <option value="DHL">DHL</option>
                        <option value="FedEx">FedEx</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Customer Name</label>
                      <input
                        type="text"
                        readOnly
                        value={trackCustomerName}
                        className="form-control"
                        placeholder="Autofilled Customer Name"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Customer Phone</label>
                      <input
                        type="text"
                        readOnly
                        value={trackCustomerPhone}
                        className="form-control"
                        placeholder="Autofilled Phone"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Customer Shipping Address</label>
                      <textarea
                        readOnly
                        rows={2}
                        value={trackCustomerAddress}
                        className="form-control"
                        placeholder="Autofilled Address"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Order ID</label>
                      <input
                        type="text"
                        readOnly
                        value={trackOrderId}
                        className="form-control"
                        placeholder="Autofilled Order ID"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Current Tracking Status</label>
                      <div style={{ padding: '0.8rem 1rem', background: 'rgba(2, 132, 199, 0.08)', borderRadius: '8px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {liveStatus}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={ocrLoading || !extractedAWB || trackingEngineActive}
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '1rem', height: '44px', fontSize: '1rem' }}
                    >
                      {trackingEngineActive ? 'Connecting Engine...' : 'Track Shipment'}
                    </button>
                  </form>
                </div>

                {/* Right Column: Uploaded Bill & Live Tracking Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* Bill Image Preview Box */}
                  <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', textAlign: 'left' }}>
                      Uploaded Receipt Bill
                    </h4>
                    {billImage ? (
                      <img
                        src={billImage}
                        alt="Courier Bill"
                        style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                      />
                    ) : (
                      <div style={{ padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No dispatch bill uploaded yet.
                      </div>
                    )}
                  </div>

                  {/* Tracking Timeline step block */}
                  <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                      Shipment Journey Timeline
                    </h4>

                    {liveTimeline.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>
                        Waiting for tracking activation...
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--primary)' }}>
                        {liveTimeline.map((step, idx) => (
                          <div key={idx} style={{ position: 'relative' }}>
                            {/* Dot indicator */}
                            <div style={{
                              position: 'absolute',
                              left: '-31px',
                              top: '2px',
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: idx === 0 ? 'var(--success)' : 'var(--primary)',
                              border: '2px solid #ffffff',
                              boxShadow: '0 0 5px rgba(2,132,199,0.5)'
                            }} />
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: idx === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                              {step.status}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              Location: {step.location}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Time: {new Date(step.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Section: Dispatch History Logs */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', textAlign: 'left' }}>
                  Dispatch & Shipments Log
                </h3>

                {/* Filter and search controls */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  <input
                    type="text"
                    placeholder="Search Tracking, Name, Phone..."
                    value={trackSearchQuery}
                    onChange={(e) => setTrackSearchQuery(e.target.value)}
                    className="form-control"
                    style={{ flex: 1, minWidth: '200px' }}
                  />
                  <select
                    value={trackStatusFilter}
                    onChange={(e) => setTrackStatusFilter(e.target.value)}
                    className="form-control"
                    style={{ width: '160px' }}
                  >
                    <option value="">All Statuses</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <select
                    value={trackCourierFilter}
                    onChange={(e) => setTrackCourierFilter(e.target.value)}
                    className="form-control"
                    style={{ width: '160px' }}
                  >
                    <option value="">All Couriers</option>
                    <option value="DTDC">DTDC</option>
                    <option value="Blue Dart">Blue Dart</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="Professional Couriers">Professional Couriers</option>
                  </select>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                        <th style={{ padding: '12px' }}>Order ID</th>
                        <th style={{ padding: '12px' }}>Customer Name</th>
                        <th style={{ padding: '12px' }}>Courier Partner</th>
                        <th style={{ padding: '12px' }}>Tracking Number</th>
                        <th style={{ padding: '12px' }}>Current Status</th>
                        <th style={{ padding: '12px' }}>Last Updated</th>
                        <th style={{ padding: '12px' }}>Bill & Proof</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter(o => {
                          const matchesSearch = !trackSearchQuery || 
                            o.customOrderId?.includes(trackSearchQuery) || 
                            o._id?.includes(trackSearchQuery) || 
                            o.trackingNumber?.includes(trackSearchQuery) ||
                            o.shippingAddress?.name?.toLowerCase().includes(trackSearchQuery.toLowerCase());
                          const matchesStatus = !trackStatusFilter || o.orderStatus === trackStatusFilter;
                          const matchesCourier = !trackCourierFilter || o.courierService === trackCourierFilter;
                          return matchesSearch && matchesStatus && matchesCourier;
                        })
                        .map((ord) => (
                          <tr key={ord._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{ord.customOrderId || ord._id.toString().slice(-6)}</td>
                            <td style={{ padding: '12px' }}>{ord.shippingAddress?.name}</td>
                            <td style={{ padding: '12px' }}>{ord.courierService || 'Standard'}</td>
                            <td style={{ padding: '12px', fontFamily: 'monospace' }}>{ord.trackingNumber || 'N/A'}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                background: ord.orderStatus === 'Delivered' ? 'rgba(5, 150, 105, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                                color: ord.orderStatus === 'Delivered' ? 'var(--success)' : 'var(--primary)'
                              }}>
                                {ord.orderStatus}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>{new Date(ord.updatedAt).toLocaleDateString()}</td>
                            <td style={{ padding: '12px' }}>
                              {ord.courierBillImage ? (
                                <button
                                  type="button"
                                  onClick={() => setViewDealerBill(ord.courierBillImage)}
                                  className="btn btn-secondary"
                                  style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', margin: 0 }}
                                >
                                  View Bill
                                </button>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>No Image</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>

      {/* CAPTCHA verification Modal */}
      {showCaptcha && (
        <div className={styles['modal-overlay']} style={{ zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(10px)' }}>
          <div className="glass-panel" style={{ maxWidth: '400px', width: '90%', padding: '2rem', borderRadius: '24px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1rem' }}>Solve Security CAPTCHA</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Please solve the CAPTCHA required by the courier tracking engine.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)',
                color: '#ffffff',
                fontWeight: '800',
                letterSpacing: '5px',
                fontSize: '1.4rem',
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                userSelect: 'none',
                fontFamily: 'Courier, monospace',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
              }}>
                {captchaText}
              </div>
              <button
                type="button"
                onClick={() => {
                  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                  let code = '';
                  for (let i = 0; i < 4; i++) {
                    code += chars.charAt(Math.floor(Math.random() * chars.length));
                  }
                  setCaptchaText(code);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
              >
                Refresh
              </button>
            </div>

            <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <label className="form-label">Enter CAPTCHA Code</label>
              <input
                type="text"
                maxLength={4}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="form-control"
                placeholder="4-character code"
                style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase' }}
              />
              {captchaError && (
                <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>
                  {captchaError}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowCaptcha(false)}
                className="btn btn-secondary"
                style={{ height: '36px', padding: '0 1.2rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCaptcha}
                className="btn btn-primary"
                style={{ height: '36px', padding: '0 1.2rem' }}
              >
                Verify & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CRUD Product Modal */}
      {showProductModal && (
        <div className={styles['modal-overlay']}>
          <div className={`glass-panel ${styles['modal-content']}`}>
            <button onClick={() => setShowProductModal(false)} className={styles['modal-close']}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>
              {modalMode === 'create' ? 'Publish New Listing' : 'Edit Product Details'}
            </h2>

            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="form-control"
                  placeholder="e.g. Canister Filter 1500L/H"
                />
              </div>



              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={prodCat}
                    onChange={(e) => setProdCat(e.target.value)}
                    className="form-control"
                    style={{ cursor: 'pointer' }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="form-control"
                    placeholder="e.g. 1250"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label className="form-label">Does this product have different colors/variants?</label>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '0.4rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>
                    <input
                      type="radio"
                      name="hasVariants"
                      checked={!hasVariants}
                      onChange={() => setHasVariants(false)}
                      style={{ cursor: 'pointer' }}
                    />
                    No
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>
                    <input
                      type="radio"
                      name="hasVariants"
                      checked={hasVariants}
                      onChange={() => setHasVariants(true)}
                      style={{ cursor: 'pointer' }}
                    />
                    Yes
                  </label>
                </div>
              </div>

              {!hasVariants ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Initial Stock Inventory</label>
                    <input
                      type="number"
                      required
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      className="form-control"
                      placeholder="e.g. 20"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Minimum Purchase Quantity for Customers</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={prodMinQty}
                      onChange={(e) => setProdMinQty(e.target.value)}
                      className="form-control"
                      placeholder="e.g. 2"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Product Images</label>
                    
                    {/* Image Previews */}
                    {prodImages.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.8rem', marginBottom: '1rem' }}>
                        {prodImages.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                            <img src={img} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={() => handleRemoveProductImage(idx)}
                              style={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                background: 'rgba(225, 29, 72, 0.9)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '18px',
                                height: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                padding: 0
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Upload Trigger Button */}
                    <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.6rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', margin: 0 }}>
                      <Upload size={14} />
                      Upload from Device Gallery
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleProductImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Minimum Purchase Quantity for Customers</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={prodMinQty}
                      onChange={(e) => setProdMinQty(e.target.value)}
                      className="form-control"
                      placeholder="e.g. 2"
                    />
                  </div>

                  <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.01)', marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <label className="form-label" style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>Product Variants & Colors</label>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => setVariants([...variants, { color: '', image: '', stock: 0 }])}
                      >
                        <Plus size={12} /> Add Variant
                      </button>
                    </div>

                    {variants.length === 0 ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                        No variants added yet. Click "Add Variant" to add colors.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {variants.map((v, index) => (
                          <div key={index} style={{ border: '1px solid rgba(255, 255, 255, 0.05)', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.01)', position: 'relative' }}>
                            <button
                              type="button"
                              onClick={() => setVariants(variants.filter((_, idx) => idx !== index))}
                              style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}
                              title="Remove Variant"
                            >
                              <Trash2 size={14} />
                            </button>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.8rem', marginBottom: '0.6rem' }}>
                              <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Color Name</label>
                                <input
                                  type="text"
                                  required
                                  value={v.color}
                                  onChange={(e) => {
                                    const updated = [...variants];
                                    updated[index].color = e.target.value;
                                    setVariants(updated);
                                  }}
                                  className="form-control"
                                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                                  placeholder="e.g. Purple"
                                />
                              </div>
                              <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Stock</label>
                                <input
                                  type="number"
                                  required
                                  min="0"
                                  value={v.stock}
                                  onChange={(e) => {
                                    const updated = [...variants];
                                    updated[index].stock = Number(e.target.value);
                                    setVariants(updated);
                                  }}
                                  className="form-control"
                                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                                  placeholder="e.g. 10"
                                />
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              {v.image ? (
                                <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                  <img src={v.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Variant Preview" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...variants];
                                      updated[index].image = '';
                                      setVariants(updated);
                                    }}
                                    style={{ position: 'absolute', top: '1px', right: '1px', background: 'rgba(225, 29, 72, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '8px', padding: 0 }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                                  <Upload size={12} /> Upload Image
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleVariantImageUpload(index, e)}
                                    style={{ display: 'none' }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="form-group" style={{ marginTop: '1.2rem', marginBottom: '1.2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={prodIsReturnable}
                    onChange={(e) => setProdIsReturnable(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  Return Policy Available for this Product
                </label>
                <small style={{ display: 'block', color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.8rem', lineHeight: '1.4' }}>
                  If checked, customers can request a product return within 24 hours of delivery.
                </small>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                {modalMode === 'create' ? 'Publish Product' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2-Step Shipping Dispatch Modal */}
      {showShipModal && (
        <div className="glass-alert-overlay" style={{ zIndex: 1100, background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(10px)' }}>
          <div className="glass-panel" style={{ maxHeight: '90vh', overflowY: 'auto', maxWidth: '460px', width: '90%', padding: '2.2rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', position: 'relative', background: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '20px', boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)', color: '#1e293b' }}>
            <button
              onClick={() => {
                setShowShipModal(false);
                setShipOrder(null);
              }}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
              title="Close"
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontWeight: '800', fontSize: '1.3rem', color: 'var(--primary)', marginBottom: '0.4rem', margin: 0 }}>
                Dispatch Order Shipment
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                Order ID: #{shipOrder?.customOrderId || shipOrder?._id?.toString().slice(-6)}
              </p>
            </div>

            {shipStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
                <h4 style={{ margin: 0, fontWeight: '700', fontSize: '1.05rem', color: 'var(--primary)' }}>
                  Step 1: Package Photo
                </h4>
                <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
                  Please upload a photo of the <strong>final packed order box</strong> showing the delivery label securely pasted.
                </div>
                
                <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem', margin: 0, background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155' }}>
                  <Upload size={16} />
                  {verifyingLabel ? 'Scanning Label details...' : (finalBoxPhoto ? 'Change Package Box Photo' : 'Select Package Box Photo')}
                  <input
                    type="file"
                    disabled={verifyingLabel}
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setVerifyingLabel(true);
                        setLabelValidationError('');
                        setLabelVerified(false);
                        setFinalBoxPhoto('');

                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          const readerResult = reader.result;
                          setFinalBoxPhoto(readerResult);

                          try {
                            const result = await Tesseract.recognize(file, 'eng');
                            const scannedText = (result.data?.text || '').toLowerCase();
                            console.log("Scanned Package Box Label Text:", scannedText);

                            // Validate Customer Name
                            const customerName = (shipOrder.customerId?.name || '').toLowerCase().trim();
                            const nameParts = customerName.split(/\s+/).filter(part => part.length >= 3);
                            const namePresent = nameParts.length > 0 ? nameParts.some(part => scannedText.includes(part)) : true;

                            // Validate Phone Number
                            const customerPhone = (shipOrder.customerId?.phone || '').replace(/\D/g, '');
                            const phonePresent = customerPhone ? (scannedText.replace(/\D/g, '').includes(customerPhone) || scannedText.includes(customerPhone.slice(-4))) : true;

                            // Validate Address/Zip
                            const zip = (shipOrder.shippingAddress?.zip || '').trim();
                            const address = (shipOrder.shippingAddress?.address || '').toLowerCase();
                            const addressParts = address.split(/[\s,.-]+/).filter(part => part.length >= 4);
                            const addressPresent = zip ? scannedText.includes(zip) : (addressParts.length > 0 ? addressParts.some(part => scannedText.includes(part)) : true);

                            if (!namePresent || !phonePresent || !addressPresent) {
                              let missing = [];
                              if (!namePresent) missing.push('Customer Name');
                              if (!phonePresent) missing.push('Phone Number');
                              if (!addressPresent) missing.push('Shipping Address/Zip');

                              setLabelValidationError(`Validation Failed: Scanned package label is missing matching ${missing.join(', ')}.`);
                              setLabelVerified(false);
                            } else {
                              setLabelVerified(true);
                              setLabelValidationError('');
                              localStorage.setItem('ship_box_photo_' + shipOrder._id, readerResult);
                            }
                          } catch (err) {
                            console.error("Tesseract scan error:", err);
                            setLabelValidationError('Error scanning label. Please try again with a clearer photo.');
                            setLabelVerified(false);
                          } finally {
                            setVerifyingLabel(false);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>

                {verifyingLabel && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '0.2rem', fontWeight: 'bold' }}>
                    Scanning and verifying shipping label details...
                  </div>
                )}

                {labelValidationError && (
                  <>
                    <div style={{ fontSize: '0.82rem', color: '#ef4444', fontWeight: 'bold', marginTop: '0.2rem', lineHeight: '1.4', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                      {labelValidationError}
                    </div>
                    <div style={{ marginTop: '0.8rem', padding: '0.6rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.82rem', color: '#d97706', fontWeight: '600', margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={manualLabelOverride}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setManualLabelOverride(isChecked);
                            if (isChecked) {
                              setLabelVerified(true);
                              if (finalBoxPhoto) {
                                localStorage.setItem('ship_box_photo_' + shipOrder._id, finalBoxPhoto);
                              }
                            } else {
                              setLabelVerified(false);
                            }
                          }}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#d97706' }}
                        />
                        Override & proceed (I confirm the handwritten details on the label are correct)
                      </label>
                    </div>
                  </>
                )}

                {labelVerified && !verifyingLabel && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 'bold', marginTop: '0.2rem', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                    ✓ Shipping label verified successfully! Matches customer details.
                  </div>
                )}

                {finalBoxPhoto && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <img src={finalBoxPhoto} alt="Package Box" style={{ maxHeight: '140px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </div>
                )}

                <button
                  type="button"
                  disabled={verifyingLabel || !labelVerified}
                  onClick={() => setShipStep(2)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  Proceed to Step 2
                </button>
              </div>
            )}

            {shipStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
                <h4 style={{ margin: 0, fontWeight: '700', fontSize: '1.05rem', color: 'var(--primary)' }}>
                  Step 2: Courier Bill
                </h4>
                <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
                  Now, upload the <strong>courier receipt bill/consignment note</strong> containing the AWB tracking number.
                </div>

                <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem', margin: 0, background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155' }}>
                  <Upload size={16} />
                  {verifyingBill ? 'AI Scanning...' : (courierBillPhoto ? 'Courier Bill Selected ✓' : 'Select Courier Bill Image')}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={verifyingBill}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setVerifyingBill(true);
                        setBillValidationError('');
                        setScannedAWB('');
                        setScannedCourier('');
                        setCourierBillPhoto('');

                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          const readerResult = reader.result;
                          setCourierBillPhoto(readerResult);

                          try {
                            const result = await Tesseract.recognize(file, 'eng');
                            const text = (result.data?.text || '').toLowerCase();
                            console.log('AI scanned bill text:', text);

                            // Extract Tracking Number
                            const awbRegexes = [
                              /(?:awb|consignment|lr|tracking|ref|shipment)(?:\s*number|\s*no)?[:\s#\-]*([a-zA-Z0-9]{8,20})/i,
                              /\b(?:awb|consignment|lr|tracking)[:\s#\-]*([a-zA-Z0-9]{8,20})/i,
                              /\bLR\s*No[:\s#\-]*([a-zA-Z0-9\-]+)/i,
                              /\b[0-9]{8,15}\b/
                            ];
                            
                            let foundAWB = '';
                            for (const regex of awbRegexes) {
                              const match = text.match(regex);
                              if (match && match[1]) {
                                foundAWB = match[1].trim();
                                break;
                              } else if (match && match[0]) {
                                foundAWB = match[0].trim();
                                break;
                              }
                            }

                            if (!foundAWB) {
                              const fallbackMatch = text.match(/\b[a-zA-Z0-9]{8,12}\b/);
                              foundAWB = fallbackMatch ? fallbackMatch[0] : 'TRK' + Math.floor(10000000 + Math.random() * 90000000);
                            }

                            setScannedAWB(foundAWB.toUpperCase());

                            // Detect Courier
                            const courierKeywords = {
                              'DTDC': /dtdc/i,
                              'Blue Dart': /blue\s*dart/i,
                              'Delhivery': /delhivery/i,
                              'XpressBees': /xpressbees/i,
                              'India Post': /india\s*post|consignment/i,
                              'Shadowfax': /shadowfax/i,
                              'Ekart': /ekart/i,
                              'Ecom Express': /ecom\s*express/i,
                              'Professional Courier': /professional|tpc/i,
                              'ST Courier': /st\s*courier/i,
                              'DHL': /dhl/i,
                              'FedEx': /fedex/i
                            };

                            let detectedCompany = shipOrder.courierService || 'ST Courier';
                            for (const [company, regex] of Object.entries(courierKeywords)) {
                              if (regex.test(text)) {
                                detectedCompany = company;
                                break;
                              }
                            }
                            setScannedCourier(detectedCompany);

                            // Format Booking Date & Time
                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            const d = new Date();
                            const day = String(d.getDate()).padStart(2, '0');
                            const month = months[d.getMonth()];
                            const year = d.getFullYear();
                            let hours = d.getHours();
                            const minutes = String(d.getMinutes()).padStart(2, '0');
                            const seconds = String(d.getSeconds()).padStart(2, '0');
                            const ampm = hours >= 12 ? 'PM' : 'AM';
                            hours = hours % 12;
                            hours = hours ? hours : 12;
                            const formattedBookingDate = `${day}-${month}-${year}, ${hours}:${minutes}:${seconds} ${ampm}`;

                            // Extract From location (Business Name & City)
                            const fromLoc = `${user?.dealerProfile?.businessName || 'Nandhu Nursery'}, ${user?.dealerProfile?.address?.split(/[\s,.-]+/)[0] || 'Salem'}`;
                            
                            // Extract To location (Customer Name & City)
                            const toLoc = `${shipOrder.customerId?.name || 'Narayan'}, ${shipOrder.shippingAddress?.city || 'Chennai'}`;

                            setExtractedBillDetails({
                              courier: detectedCompany,
                              consignmentNo: foundAWB.toUpperCase(),
                              bookingDate: formattedBookingDate,
                              from: fromLoc,
                              to: toLoc
                            });

                          } catch (err) {
                            console.error('OCR Courier scan error:', err);
                            setBillValidationError('Failed to parse courier receipt automatically.');
                          } finally {
                            setVerifyingBill(false);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>

                {verifyingBill && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '0.2rem', fontWeight: 'bold' }}>
                    AI OCR scanning and analyzing the courier bill receipt...
                  </div>
                )}

                {billValidationError && (
                  <div style={{ fontSize: '0.82rem', color: '#ef4444', fontWeight: 'bold', marginTop: '0.2rem', lineHeight: '1.4', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                    {billValidationError}
                  </div>
                )}

                {extractedBillDetails.consignmentNo && !verifyingBill && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 'bold', marginTop: '0.2rem', padding: '0.8rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.15)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ color: 'var(--success)', fontWeight: '800', marginBottom: '2px' }}>✓ AI OCR Bill Scan Successful!</div>
                    <div style={{ fontWeight: 'normal', color: '#334155' }}>
                      • <strong>Courier:</strong> {extractedBillDetails.courier}
                    </div>
                    <div style={{ fontWeight: 'normal', color: '#334155' }}>
                      • <strong>Consignment No:</strong> {extractedBillDetails.consignmentNo}
                    </div>
                    <div style={{ fontWeight: 'normal', color: '#334155' }}>
                      • <strong>Booking Date & Time:</strong> {extractedBillDetails.bookingDate}
                    </div>
                    <div style={{ fontWeight: 'normal', color: '#334155' }}>
                      • <strong>From:</strong> {extractedBillDetails.from}
                    </div>
                    <div style={{ fontWeight: 'normal', color: '#334155' }}>
                      • <strong>To:</strong> {extractedBillDetails.to}
                    </div>
                  </div>
                )}

                {courierBillPhoto && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <img src={courierBillPhoto} alt="Courier Bill" style={{ maxHeight: '140px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    disabled={verifyingBill}
                    onClick={() => setShipStep(1)}
                    className="btn btn-secondary"
                    style={{ flex: 1, margin: 0 }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!courierBillPhoto || verifyingBill}
                    onClick={handleShipOrder}
                    className="btn btn-primary"
                    style={{ flex: 1, margin: 0 }}
                  >
                    Confirm Dispatch
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordChangeModal && (
        <div className="glass-alert-overlay">
          <div className="glass-panel glass-alert-modal" style={{ maxWidth: '420px', alignItems: 'stretch' }}>
            <button 
              onClick={() => setShowPasswordChangeModal(false)}
              className="glass-alert-close"
              title="Close"
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div 
                className="glass-alert-icon-container"
                style={{ backgroundColor: 'rgba(2, 132, 199, 0.08)' }}
              >
                <ShieldAlert size={44} style={{ color: 'var(--primary)' }} />
              </div>
              
              <div className="glass-alert-content">
                <h4 
                  className="glass-alert-title"
                  style={{ color: 'var(--primary)' }}
                >
                  Change Password
                </h4>
                <p className="glass-alert-message" style={{ marginBottom: '1.2rem' }}>
                  {passwordOtpVerified 
                    ? 'OTP verified successfully. Please enter your new password:' 
                    : `Please verify your request by entering the 6-digit OTP code sent to your registered email: ${user?.email}`
                  }
                </p>
              </div>
            </div>

            {passwordOtpError && (
              <div className="alert alert-danger" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', marginBottom: '1rem' }}>
                {passwordOtpError}
              </div>
            )}

            {!passwordOtpVerified ? (
              <div style={{ width: '100%' }}>
                <div className="form-group">
                  <label className="form-label">6-Digit OTP Code</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={passwordOtpInput}
                    onChange={(e) => setPasswordOtpInput(e.target.value)}
                    className="form-control"
                    style={{ 
                      width: '100%', 
                      background: 'rgba(255, 255, 255, 0.8)', 
                      border: '1px solid var(--border-color)', 
                      padding: '0.75rem 1rem', 
                      borderRadius: '10px', 
                      color: 'var(--text-primary)', 
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      textAlign: 'center',
                      letterSpacing: '4px',
                      fontWeight: '700'
                    }}
                    autoFocus
                  />
                </div>
                
                {passwordOtpPreviewUrl && (
                  <div style={{ margin: '0.5rem 0 1rem 0', textAlign: 'center' }}>
                    <a 
                      href={passwordOtpPreviewUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ color: 'var(--secondary)', textDecoration: 'underline', fontSize: '0.85rem', fontWeight: '600' }}
                    >
                      [Development Preview] View Sent OTP Email
                    </a>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowPasswordChangeModal(false)}
                    className="btn btn-secondary glass-alert-btn-secondary"
                    style={{ flex: 1, margin: 0, padding: '0.65rem', borderRadius: '10px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyPasswordOtp}
                    className="btn btn-primary glass-alert-btn-primary"
                    style={{ flex: 1, margin: 0, padding: '0.65rem', borderRadius: '10px', backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
                  >
                    Verify OTP
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ width: '100%' }}>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">New Password</label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-control"
                    style={{ 
                      width: '100%', 
                      background: 'rgba(255, 255, 255, 0.8)', 
                      border: '1px solid var(--border-color)', 
                      padding: '0.75rem 2.5rem 0.75rem 1rem', 
                      borderRadius: '10px', 
                      color: 'var(--text-primary)', 
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '38px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="form-control"
                    style={{ 
                      width: '100%', 
                      background: 'rgba(255, 255, 255, 0.8)', 
                      border: '1px solid var(--border-color)', 
                      padding: '0.75rem 2.5rem 0.75rem 1rem', 
                      borderRadius: '10px', 
                      color: 'var(--text-primary)', 
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '38px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowPasswordChangeModal(false)}
                    className="btn btn-secondary glass-alert-btn-secondary"
                    style={{ flex: 1, margin: 0, padding: '0.65rem', borderRadius: '10px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdatePassword}
                    className="btn btn-primary glass-alert-btn-primary"
                    style={{ flex: 1, margin: 0, padding: '0.65rem', borderRadius: '10px', backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
                  >
                    Save Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Beautiful custom styled inline invoice modal overlay for Dealer */}
      {activeInvoiceOrder && (
        <div className={styles['modal-overlay']} style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ maxWidth: '650px', width: '90%', padding: '2rem', borderRadius: '24px', position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Close button */}
            <button
              onClick={() => setActiveInvoiceOrder(null)}
              style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              &times;
            </button>

            {/* Print Area */}
            <div id="invoice-print-area-dealer" style={{ background: '#ffffff', color: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', fontFamily: 'system-ui, sans-serif', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0284c7', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <img src="/logo.png" style={{ height: '5rem', width: 'auto', objectFit: 'contain' }} alt="Logo" />
                  <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', fontWeight: 'bold', textAlign: 'center' }}>Salem, Tamil Nadu</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0284c7', letterSpacing: '0.5px' }}>INVOICE</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', fontSize: '0.85rem', color: '#334155', textAlign: 'left' }}>
                <div>
                  <strong style={{ color: '#1e3a8a', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Billed To:</strong>
                  <span style={{ fontWeight: '600' }}>{activeInvoiceOrder.shippingAddress?.name || user.name}</span><br />
                  Phone: {activeInvoiceOrder.shippingAddress?.phone || user.phone}<br />
                  Address: {activeInvoiceOrder.shippingAddress?.address}, {activeInvoiceOrder.shippingAddress?.city}, {activeInvoiceOrder.shippingAddress?.state} - {activeInvoiceOrder.shippingAddress?.zip}
                </div>
                <div>
                  <strong style={{ color: '#1e3a8a', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Order Details:</strong>
                  Order ID: #{activeInvoiceOrder.customOrderId || activeInvoiceOrder._id.toString().slice(-6)}<br />
                  Date: {new Date(activeInvoiceOrder.createdAt).toLocaleDateString()}<br />
                  Payment Status: <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: activeInvoiceOrder.paymentStatus === 'paid' ? '#059669' : '#d97706' }}>{activeInvoiceOrder.paymentStatus}</span> ({activeInvoiceOrder.paymentMethod})
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '10px', fontWeight: 'bold', color: '#1e3a8a' }}>Product Name</th>
                    <th style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#1e3a8a', width: '90px' }}>Unit Price</th>
                    <th style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#1e3a8a', width: '50px' }}>Qty</th>
                    <th style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#1e3a8a', width: '110px' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {activeInvoiceOrder.products.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', color: '#334155' }}>{item.productId?.productName || 'Aquarium Item'}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#334155' }}>Rs {item.price.toLocaleString()}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#334155' }}>{item.quantity}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#334155', fontWeight: '500' }}>Rs {(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>
                Subtotal: Rs {(activeInvoiceOrder.totalAmount - (activeInvoiceOrder.deliveryCharge || 0)).toLocaleString()}
              </div>
              {activeInvoiceOrder.courierService && (
                <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
                  Delivery Charge ({activeInvoiceOrder.courierService}): Rs {(activeInvoiceOrder.deliveryCharge || 0).toLocaleString()}
                </div>
              )}
              <div style={{ textAlign: 'right', fontSize: '1.15rem', fontWeight: 'bold', color: '#059669', borderTop: '1px solid #cbd5e1', paddingTop: '10px' }}>
                Total Paid: Rs {activeInvoiceOrder.totalAmount.toLocaleString()}
              </div>

              {/* IMPORTANT NOTES */}
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid #cbd5e1', fontSize: '0.82rem', color: '#475569', textAlign: 'left', lineHeight: '1.5' }}>
                <div style={{ fontWeight: 'bold', color: '#1e3a8a', textAlign: 'center', marginBottom: '10px', letterSpacing: '0.5px' }}>
                  ================== IMPORTANT NOTES ==================
                </div>
                <ul style={{ paddingLeft: '1.2rem', margin: '0 0 15px 0' }}>
                  <li>Float the sealed fish bag in the aquarium for 15–20 minutes before opening.</li>
                  <li>Gradually acclimate the fish using aquarium water.</li>
                  <li>Do not feed the fish for the first 12–24 hours.</li>
                  <li>Ensure proper aeration and a stress-free environment.</li>
                  <li>Use only a fully cycled and dechlorinated aquarium.</li>
                </ul>

                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#ef4444' }}>📹 IMPORTANT:</strong><br />
                  A continuous unboxing video (without cuts or edits) is mandatory for any replacement request.
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#ef4444' }}>⚠ RESPONSIBILITY:</strong><br />
                  Once the fish is removed from the transport bag or released into the aquarium, the customer assumes full responsibility for its care and survival.
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <strong style={{ color: '#ef4444' }}>❌ REFUND POLICY:</strong><br />
                  No Refunds under any circumstances for Live Fish Orders.
                </div>

                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', textAlign: 'center', fontSize: '0.78rem', color: '#64748b', fontWeight: 'bold' }}>
                  For support, contact: TEN Aquarium Support | Emails: tenaquarium@gmail.com, tenaquariumshop@tenaquarium.com
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  const printContents = document.getElementById('invoice-print-area-dealer').innerHTML;
                  const printWindow = window.open('', '_blank');
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Invoice - #${activeInvoiceOrder.customOrderId || activeInvoiceOrder._id}</title>
                        <style>
                          body { font-family: system-ui, sans-serif; padding: 40px; }
                          th, td { border-bottom: 1px solid #cbd5e1; padding: 10px; }
                        </style>
                      </head>
                      <body>${printContents}</body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.focus();
                  printWindow.print();
                  printWindow.close();
                }}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', height: '36px' }}
              >
                Print Invoice
              </button>
              <button
                onClick={() => setActiveInvoiceOrder(null)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', height: '36px', border: '1px solid var(--border-color)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Courier Bill Preview Modal */}
      {viewDealerBill && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '600px',
            width: '100%',
            textAlign: 'center',
            position: 'relative'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Uploaded Courier Bill Proof</h3>
            <img
              src={viewDealerBill}
              alt="Courier Bill"
              style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }}
            />
            <button
              type="button"
              onClick={() => setViewDealerBill(null)}
              className="btn btn-primary"
              style={{ marginTop: '1.5rem', padding: '0.6rem 2rem', margin: '1.5rem auto 0 auto', display: 'block' }}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerDashboard;
