# Import Library
import cv2
import os
# https://www.makeuseof.com/how-to-create-and-decode-a-qr-code-using-python/

# folder path
# dir_path = r'.\\qrcodeGen\\'
"""
    Finds all folders in the base directory that start with 'qrCodes' and returns a list of their full paths.
    
    Args:
        base_dir (str): The base directory to search for 'qrCodes' folders.
    
    Returns:
        list: A list of full paths to all 'qrCodes' folders found in the base directory.
    """
def find_qr_code_folders(base_dir):
    qr_code_folders = []
    for folder in os.listdir(base_dir):
        if folder.startswith('qrCodes') and os.path.isdir(os.path.join(base_dir, folder)):
            qr_code_folders.append(os.path.join(base_dir, folder))
    return qr_code_folders


"""
    Decodes QR codes in all files within the specified folder.
    
    Args:
        folder_path (str): The path to the folder containing the QR code images.
    
    Returns:
        None
"""
def decode_qr_codes_in_folder(folder_path):
    for file in os.listdir(folder_path):
        file_path = os.path.join(folder_path, file)
        if os.path.isfile(file_path):
            image = cv2.imread(file_path)
            if image is not None:             
                detector = cv2.QRCodeDetector()
                # Erkenne und dekodiere
                data, vertices_array, binary_qrcode = detector.detectAndDecode(image)
                # Wenn ein QR-Code erkannt wird, drucke die Daten
                if vertices_array is not None:
                    print(f"QR Code in file {file_path}: {data}")

# Basisverzeichnis 
script_dir = os.path.dirname(os.path.abspath(__file__))

base_dir = os.path.abspath(os.path.join(script_dir, '..'))

qr_code_folders = find_qr_code_folders(base_dir)


for folder in qr_code_folders:
    decode_qr_codes_in_folder(folder)