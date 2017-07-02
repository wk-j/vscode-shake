-- stack runghc --package shake

import Development.Shake

main :: IO()
main = shakeArgs shakeOptions $ do
    want ["README.md"]
    "README.md" %> \_ -> do
        need ["build.hs"]
        return ()
