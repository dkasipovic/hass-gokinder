
#!/usr/bin/with-contenv bashio
set +u

export GOKINDER_USERNAME=$(bashio::config 'gokinder_username')
export GOKINDER_PASSWORD=$(bashio::config 'gokinder_password')
export GOKINDER_HOSTNAME=$(bashio::config 'gokinder_hostname')
export GOKINDER_TIMEOUT=$(bashio::config 'gokinder_timeout')
bashio::log.info "GoKinder username: ${GOKINDER_USERNAME}"
bashio::log.info "GoKinder password: ${GOKINDER_PASSWORD}"
bashio::log.info "GoKinder hostname: ${GOKINDER_HOSTNAME}"
bashio::log.info "GoKinder timeout: ${GOKINDER_TIMEOUT}"

bashio::log.info "Starting GoKinder..."
node index.js