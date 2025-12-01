// Replace lines 225-269 with this updated useEffect
  useEffect(() => {
    const initAutocomplete = async () => {
      if (autocompleteElRef.current) {
        try {
          // @ts-expect-error - Google Maps web component
          await google.maps.importLibrary("places");
          
          // Set initial value if exists
          if (formData.preferredShippingAddress) {
            autocompleteElRef.current.value = formData.preferredShippingAddress;
          }
          
          // Listen for place selection
          autocompleteElRef.current.addEventListener('gmp-placeselect', async (event: Event) => {
            const customEvent = event as CustomEvent;
            const place = customEvent.detail?.place;
            if (place) {
              await place.fetchFields({ fields: ['formattedAddress'] });
              const address = place.formattedAddress || '';
              setFormData(prev => ({ ...prev, preferredShippingAddress: address }));
            }
          });
          
          // Capture all input changes
          const captureValue = () => {
            if (autocompleteElRef.current) {
              const address = autocompleteElRef.current.value || '';
              setFormData(prev => ({ ...prev, preferredShippingAddress: address }));
            }
          };
          
          autocompleteElRef.current.addEventListener('input', captureValue);
          autocompleteElRef.current.addEventListener('change', captureValue);
          autocompleteElRef.current.addEventListener('blur', captureValue);
          
          // Apply black text styling - multiple attempts to ensure it works
          const applyStyles = () => {
            const element = autocompleteElRef.current;
            if (!element) return;
            
            // Try to access shadow root and inject styles
            if (element.shadowRoot) {
              const existingStyle = element.shadowRoot.querySelector('style[data-custom]');
              if (!existingStyle) {
                const style = document.createElement('style');
                style.setAttribute('data-custom', 'true');
                style.textContent = `
                  input {
                    color: #000000 !important;
                    -webkit-text-fill-color: #000000 !important;
                  }
                  input::placeholder {
                    color: #6b7280 !important;
                  }
                `;
                element.shadowRoot.appendChild(style);
              }
            }
            
            // Also try to find and style the input directly
            const input = element.shadowRoot?.querySelector('input');
            if (input) {
              input.style.color = '#000000';
              input.style.webkitTextFillColor = '#000000';
            }
          };
          
          // Apply styles immediately and after delays
          setTimeout(applyStyles, 100);
          setTimeout(applyStyles, 300);
          setTimeout(applyStyles, 500);
          
          // Also apply on focus
          autocompleteElRef.current.addEventListener('focus', applyStyles);
          
        } catch (error) {
          console.error('Error initializing Google Places Autocomplete:', error);
        }
      }
    };

    initAutocomplete();
  }, []);
