from download_pkg import *

# %% each day
try:
    download_RKI_COVID19_meta()
except Exception as e:
    print(e)